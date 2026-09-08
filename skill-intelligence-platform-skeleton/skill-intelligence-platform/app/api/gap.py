"""
Gap Analysis Router — trigger and view officer competency gap reports.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Official, CompetencyScore, Competency, RoleCompetencyRequirement, Role
from app.domain.models import OfficerProfile
from app.domain.profile_extractor import extract_profile
from app.services.gap_service import run_gap_analysis

router = APIRouter(prefix="/officers", tags=["Gap Analysis"])


class GapAnalysisRequest(BaseModel):
    role_code: Optional[str] = None         # If omitted, uses officer's assigned role
    profile_text: Optional[str] = None     # If provided, runs LLM profile extraction first


@router.post("/{officer_id}/gap-analysis")
def compute_gap_analysis(
    officer_id: str,
    payload: Optional[GapAnalysisRequest] = None,
    db: Session = Depends(get_db),
):
    """
    Run full gap analysis for an officer.
    Option 1: Pass `profile_text` -> extracts evidence via LLM, scores evidence, computes gaps.
    Option 2: No `profile_text` -> computes gaps using officer's existing DB evidence/scores.
    """
    official = db.query(Official).filter_by(id=officer_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="Officer not found")

    role_code = (payload.role_code if payload and payload.role_code else None) or (
        official.role.code if official.role else "SSO"
    )

    if payload and payload.profile_text:
        # Extract profile via LLM and score
        try:
            profile: OfficerProfile = extract_profile(
                officer_id=officer_id,
                role_code=role_code,
                profile_text=payload.profile_text,
            )
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"LLM extraction failed: {str(e)}")

        report_dict = run_gap_analysis(db, officer_id, role_code, profile, save_to_db=True)
        return report_dict
    else:
        # Generate gap report using current DB scores
        from app.domain.evidence_scorer import score_all_competencies
        from app.domain.gap_engine import calculate_gap_report, gap_report_to_dict
        from app.domain.models import CompetencyScoreBreakdown

        # Load existing scores from DB
        scores_in_db = (
            db.query(CompetencyScore, Competency)
            .join(Competency, CompetencyScore.competency_id == Competency.id)
            .filter(CompetencyScore.official_id == officer_id)
            .all()
        )

        if not scores_in_db:
            # Auto-initialize baseline competency scores if none exist in DB yet
            baseline_defaults = {
                "JSO": {
                    "OS-01": 1.5, "OS-02": 1.0, "OS-10": 2.0,
                    "TC-01": 0.5, "TC-03": 1.2, "BM-02": 2.5, "TC-02": 2.0,
                    "OS-03": 1.0, "OS-08": 1.5, "DG-01": 1.0, "DG-02": 1.8
                },
                "SSO": {
                    "OS-03": 2.2, "DG-02": 2.5, "TC-07": 1.5,
                    "TC-01": 2.0, "TC-08": 2.8, "BM-01": 2.0, "OS-01": 2.8, "OS-02": 2.5
                },
                "MCTP-II": {
                    "BM-05": 3.0, "DG-05": 2.8, "BM-02": 3.5,
                    "TC-10": 2.5, "BM-06": 2.8, "OS-03": 3.2
                },
                "MCTP-III": {
                    "OS-11": 3.5, "TC-09": 3.0, "BM-03": 4.0,
                    "DG-01": 3.8, "BM-04": 4.2, "OS-01": 4.5
                }
            }
            role_defaults = baseline_defaults.get(role_code, baseline_defaults["JSO"])
            all_comps = db.query(Competency).all()
            for comp in all_comps:
                score_val = role_defaults.get(comp.code, 1.2)
                cs = CompetencyScore(
                    official_id=officer_id,
                    competency_id=comp.id,
                    current_score=score_val,
                )
                db.add(cs)
            db.commit()

            scores_in_db = (
                db.query(CompetencyScore, Competency)
                .join(Competency, CompetencyScore.competency_id == Competency.id)
                .filter(CompetencyScore.official_id == officer_id)
                .all()
            )

        scores_dict: dict[str, CompetencyScoreBreakdown] = {}
        for sc, comp in scores_in_db:
            scores_dict[comp.code] = CompetencyScoreBreakdown(
                competency_code=comp.code,
                final_score=float(sc.current_score),
            )

        report = calculate_gap_report(db, officer_id, role_code, scores_dict)
        return gap_report_to_dict(report)


@router.get("/{officer_id}/gap-analysis")
def get_stored_gap_analysis(officer_id: str, db: Session = Depends(get_db)):
    """Retrieve existing gap analysis for an officer from DB."""
    return compute_gap_analysis(officer_id, payload=None, db=db)
