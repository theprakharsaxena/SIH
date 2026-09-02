"""
Assessment Service — orchestrates MCQ generation, quiz scoring, and the CLOSED LOOP.

The closed loop is the key differentiator:
  After a quiz submission → new Assessment evidence is written →
  competency score is recomputed → gap reduces → new recommendations generated.

This is the "money moment" in the demo.
"""
import os
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.db.models import (
    UploadedMaterial, Assessment, AssessmentQuestion,
    AssessmentResult, CompetencyEvidence, CompetencyScore, Competency,
)
from app.domain.mcq_engine import generate_mcqs, score_answers, mcq_to_dict, MCQQuestion
from app.domain.evidence_scorer import (
    score_assessment as score_assessment_evidence,
    WEIGHT_ASSESSMENT,
)
from app.domain.evidence_scorer import score_all_competencies
from app.domain.models import AssessmentEvidence, OfficerProfile


def create_assessment_from_upload(
    db: Session,
    officer_id: str,
    competency_code: str,
    filepath: str,
    filename: str,
    total_questions: int = 10,
) -> dict:
    """
    Full pipeline: upload file → extract text → generate MCQs → save to DB.

    Returns:
        {"assessment_id": ..., "questions": [...], "total_questions": ...}
    """
    # 1. Save uploaded material record
    material = UploadedMaterial(
        uploaded_by=officer_id,
        filename=filename,
        competency_id=_get_competency_id(db, competency_code),
        storage_path=filepath,
        uploaded_at=datetime.now(timezone.utc),
    )
    db.add(material)
    db.flush()

    # 2. Generate MCQs from file
    questions: list[MCQQuestion] = generate_mcqs(
        filepath=filepath,
        competency_code=competency_code,
        total_questions=total_questions,
    )

    if not questions:
        raise ValueError("MCQ generation returned no questions. Check file content and LLM connection.")

    # 3. Save assessment session
    assessment = Assessment(
        official_id=officer_id,
        competency_id=_get_competency_id(db, competency_code),
        source_material_id=material.id,
        created_at=datetime.now(timezone.utc),
    )
    db.add(assessment)
    db.flush()

    # 4. Save questions
    for q in questions:
        db.add(AssessmentQuestion(
            assessment_id=assessment.id,
            question_text=q.question_text,
            options=[{"id": o.id, "text": o.text} for o in q.options],
            correct_option_id=q.correct_option_id,
            explanation=q.explanation,
            difficulty=q.difficulty,
            source_excerpt_ref=q.source_excerpt_ref,
        ))

    db.commit()

    return {
        "assessment_id": assessment.id,
        "questions": [mcq_to_dict(q) for q in questions],
        "total_questions": len(questions),
    }


def submit_quiz_and_update_competency(
    db: Session,
    officer_id: str,
    assessment_id: str,
    answers: dict[int, str],   # {question_index: selected_option_id}
) -> dict:
    """
    Score the quiz AND update the competency score (THE CLOSED LOOP).

    Returns a dict showing:
      - score_percent
      - old competency score (before this assessment)
      - new competency score (after this assessment)
      - old gap / new gap (for the demo "money moment")
    """
    # 1. Load assessment + questions
    assessment = db.query(Assessment).filter_by(id=assessment_id).one_or_none()
    if not assessment:
        raise ValueError(f"Assessment {assessment_id} not found")

    db_questions = db.query(AssessmentQuestion).filter_by(assessment_id=assessment_id).all()
    if not db_questions:
        raise ValueError("No questions found for this assessment")

    # Reconstruct MCQQuestion list for scoring
    from app.domain.mcq_engine import MCQQuestion, MCQOption
    mcq_list = [
        MCQQuestion(
            question_text=q.question_text,
            options=[MCQOption(id=o["id"], text=o["text"]) for o in q.options],
            correct_option_id=q.correct_option_id,
            explanation=q.explanation or "",
            difficulty=q.difficulty or "medium",
            source_excerpt_ref=q.source_excerpt_ref or "",
            competency_code=assessment.competency_id,
            source_chunk="",
        )
        for q in db_questions
    ]

    # 2. Score the quiz
    score_percent, detailed_results = score_answers(mcq_list, answers)

    # 3. Save result
    db.add(AssessmentResult(
        assessment_id=assessment_id,
        official_id=officer_id,
        score_percent=score_percent,
        completed_at=datetime.now(timezone.utc),
    ))

    # 4. THE CLOSED LOOP — update competency score
    comp = db.query(Competency).filter_by(id=assessment.competency_id).one()
    old_score_row = db.query(CompetencyScore).filter_by(
        official_id=officer_id, competency_id=assessment.competency_id
    ).one_or_none()
    old_score = float(old_score_row.current_score) if old_score_row else 0.0

    # Write new Assessment evidence (rule A: test_percent / 20)
    raw_score = round(score_percent / 20.0, 2)
    db.add(CompetencyEvidence(
        official_id=officer_id,
        competency_id=assessment.competency_id,
        evidence_type="assessment",
        raw_fact={"test_percent": score_percent, "assessment_id": assessment_id},
        raw_score=raw_score,
        weight_applied=WEIGHT_ASSESSMENT,
        extracted_by="assessment_engine",
        source_reference=f"Assessment {assessment_id}",
    ))

    # Recompute total score from ALL evidence for this competency
    all_evidence = db.query(CompetencyEvidence).filter_by(
        official_id=officer_id, competency_id=assessment.competency_id
    ).all()

    new_score = _recompute_score_from_evidence(all_evidence)

    # Upsert competency score
    if old_score_row is None:
        old_score_row = CompetencyScore(
            official_id=officer_id, competency_id=assessment.competency_id
        )
        db.add(old_score_row)
    old_score_row.current_score = new_score
    old_score_row.computed_at = datetime.now(timezone.utc)

    db.commit()

    return {
        "assessment_id": assessment_id,
        "score_percent": score_percent,
        "questions_total": len(mcq_list),
        "questions_correct": sum(1 for r in detailed_results if r["is_correct"]),
        "competency_code": comp.code,
        "competency_name": comp.name,
        "score_before": round(old_score, 2),
        "score_after": round(new_score, 2),
        "score_change": round(new_score - old_score, 2),
        "detailed_results": detailed_results,
    }


def _recompute_score_from_evidence(evidence_rows) -> float:
    """
    Recompute the weighted 0-5 score from all evidence rows in the DB.
    Uses the same formula as evidence_scorer but reads from persisted evidence.
    """
    type_scores: dict[str, list[float]] = {
        "assessment": [], "experience": [], "prior_training": [],
        "education": [], "self_report": [],
    }
    type_weights = {
        "assessment": WEIGHT_ASSESSMENT,
        "experience": 0.25,
        "prior_training": 0.20,
        "education": 0.15,
        "self_report": 0.10,
    }

    for ev in evidence_rows:
        if ev.raw_score is not None:
            type_scores[ev.evidence_type].append(float(ev.raw_score))

    total = 0.0
    for ev_type, raw_scores in type_scores.items():
        if raw_scores:
            best_score = max(raw_scores)   # take best evidence per type
            total += best_score * type_weights[ev_type]

    return round(min(total, 5.0), 2)


def _get_competency_id(db: Session, code: str) -> str | None:
    comp = db.query(Competency).filter_by(code=code).one_or_none()
    return comp.id if comp else None
