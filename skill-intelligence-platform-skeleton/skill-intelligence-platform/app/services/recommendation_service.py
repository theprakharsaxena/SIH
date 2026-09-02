"""
Recommendation Service — orchestrates gap report → recommendation engine → DB writes.
"""
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.db.models import Recommendation, Competency
from app.domain.models import GapReport
from app.domain.recommendation_engine import recommend_courses, recommendations_to_dict


def run_recommendations(
    db: Session,
    officer_id: str,
    gap_report: GapReport,
    top_n: int = 10,
    save_to_db: bool = True,
) -> list[dict]:
    """
    Generate and persist course recommendations for an officer.

    Args:
        db: DB session
        officer_id: officer UUID
        gap_report: output of gap_engine.calculate_gap_report()
        top_n: number of recommendations to return
        save_to_db: if True, persist to recommendations table

    Returns:
        List of recommendation dicts (API-ready)
    """
    recommendations = recommend_courses(db, officer_id, gap_report, top_n=top_n)

    if save_to_db and recommendations:
        comp_code_to_id = {c.code: c.id for c in db.query(Competency).all()}

        # Clear previous recommendations for this officer (replace with fresh batch)
        db.query(Recommendation).filter_by(official_id=officer_id).delete()

        for rec in recommendations:
            comp_id = comp_code_to_id.get(rec.competency_code)
            if not comp_id:
                continue
            db.add(Recommendation(
                official_id=officer_id,
                course_id=rec.course_id,
                competency_id=comp_id,
                gap_at_time=rec.gap_addressed,
                score=rec.relevance_score,
                score_breakdown=rec.score_breakdown,
                reason_text=rec.reason_text,
                generated_at=datetime.now(timezone.utc),
            ))
        db.commit()

    return recommendations_to_dict(recommendations)
