"""
Gap Service — orchestrates profile extraction → scoring → gap calculation → DB writes.
This is the single entry point for computing an officer's full gap report.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.db.models import (
    Official, CompetencyEvidence, CompetencyScore,
    Role, Competency,
)
from app.domain import models as dm
from app.domain.evidence_scorer import score_all_competencies
from app.domain.gap_engine import calculate_gap_report, gap_report_to_dict


def run_gap_analysis(
    db: Session,
    officer_id: str,
    role_code: str,
    officer_profile: dm.OfficerProfile,
    save_to_db: bool = True,
) -> dict:
    """
    Full gap analysis pipeline for an officer.

    Args:
        db: DB session
        officer_id: officer UUID in DB
        role_code: e.g. 'SSO'
        officer_profile: OfficerProfile from profile_extractor (or manually built)
        save_to_db: if True, persist evidence + scores to DB

    Returns:
        GapReport as a dict (API-ready)
    """
    # 1. Get all competency codes from DB
    all_competencies = db.query(Competency).all()
    all_codes = [c.code for c in all_competencies]
    comp_code_to_id = {c.code: c.id for c in all_competencies}

    # 2. Score all competencies with the evidence scorer (deterministic)
    scores = score_all_competencies(officer_profile, all_codes)

    # 3. Persist evidence and scores to DB
    if save_to_db:
        _save_evidence(db, officer_id, officer_profile, comp_code_to_id)
        _save_scores(db, officer_id, scores, comp_code_to_id)
        db.commit()

    # 4. Calculate gap report (reads role requirements from DB)
    gap_report = calculate_gap_report(db, officer_id, role_code, scores)

    return gap_report_to_dict(gap_report)


def _save_evidence(
    db: Session,
    officer_id: str,
    profile: dm.OfficerProfile,
    comp_code_to_id: dict[str, str],
):
    """Persist all evidence items from a profile to competency_evidence table."""
    from app.domain.evidence_scorer import (
        score_assessment, score_experience, score_training,
        score_education, score_self_report,
        WEIGHT_ASSESSMENT, WEIGHT_EXPERIENCE, WEIGHT_TRAINING,
        WEIGHT_EDUCATION, WEIGHT_SELF_REPORT,
    )

    def add_evidence(comp_code, ev_type, raw_fact, raw_score, weight):
        comp_id = comp_code_to_id.get(comp_code)
        if not comp_id:
            return
        db.add(CompetencyEvidence(
            official_id=officer_id,
            competency_id=comp_id,
            evidence_type=ev_type,
            raw_fact=raw_fact,
            raw_score=round(raw_score, 2),
            weight_applied=weight,
            extracted_by="llm",
        ))

    for e in profile.assessments:
        add_evidence(e.competency_code, "assessment",
                     {"test_percent": e.test_percent, "source": e.source_reference},
                     score_assessment(e), WEIGHT_ASSESSMENT)

    for e in profile.experiences:
        add_evidence(e.competency_code, "experience",
                     {"years": e.years, "relevance": e.relevance, "source": e.source_reference},
                     score_experience(e), WEIGHT_EXPERIENCE)

    for e in profile.trainings:
        from app.domain.evidence_scorer import score_training
        add_evidence(e.competency_code, "prior_training",
                     {"course_level": e.course_level, "passed": e.passed_assessment, "title": e.course_title},
                     score_training(e), WEIGHT_TRAINING)

    for e in profile.education:
        add_evidence(e.competency_code, "education",
                     {"education_score": e.education_score, "degree": e.degree, "field": e.field},
                     score_education(e), WEIGHT_EDUCATION)

    for e in profile.self_reports:
        add_evidence(e.competency_code, "self_report",
                     {"self_score": e.self_score},
                     score_self_report(e), WEIGHT_SELF_REPORT)


def _save_scores(
    db: Session,
    officer_id: str,
    scores: dict[str, dm.CompetencyScoreBreakdown],
    comp_code_to_id: dict[str, str],
):
    """Upsert competency scores for all scored competencies."""
    for comp_code, breakdown in scores.items():
        comp_id = comp_code_to_id.get(comp_code)
        if not comp_id:
            continue
        obj = db.query(CompetencyScore).filter_by(
            official_id=officer_id, competency_id=comp_id
        ).one_or_none()
        if obj is None:
            obj = CompetencyScore(official_id=officer_id, competency_id=comp_id)
            db.add(obj)
        obj.current_score = breakdown.final_score
        obj.computed_at = datetime.now(timezone.utc)
