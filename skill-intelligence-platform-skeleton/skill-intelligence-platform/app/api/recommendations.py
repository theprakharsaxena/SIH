"""
Recommendations & Courses API Router — fetch personalized courses and browse catalog.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Official, Course, CourseCompetency, Competency, Recommendation
from app.domain.gap_engine import calculate_gap_report
from app.domain.models import CompetencyScoreBreakdown
from app.services.recommendation_service import run_recommendations

router = APIRouter(tags=["Recommendations & Courses"])


@router.get("/officers/{officer_id}/recommendations")
def get_officer_recommendations(
    officer_id: str,
    top_n: int = Query(default=10, ge=1, le=50),
    db: Session = Depends(get_db),
):
    """
    Get personalized course recommendations for an officer.
    Uses the 5-factor ranking formula + explainable reasoning.
    """
    official = db.query(Official).filter_by(id=officer_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="Officer not found")

    role_code = official.role.code if official.role else "SSO"

    # Compute current gap report
    from app.db.models import CompetencyScore
    scores_in_db = (
        db.query(CompetencyScore, Competency)
        .join(Competency, CompetencyScore.competency_id == Competency.id)
        .filter(CompetencyScore.official_id == officer_id)
        .all()
    )

    scores_dict = {
        comp.code: CompetencyScoreBreakdown(
            competency_code=comp.code,
            final_score=float(sc.current_score),
        )
        for sc, comp in scores_in_db
    }

    gap_report = calculate_gap_report(db, officer_id, role_code, scores_dict)

    recommendations = run_recommendations(
        db, officer_id=officer_id, gap_report=gap_report, top_n=top_n, save_to_db=True
    )

    return {
        "officer_id": officer_id,
        "role_code": role_code,
        "total_recommendations": len(recommendations),
        "recommendations": recommendations,
    }


@router.get("/courses")
def list_courses(
    provider_type: Optional[str] = None,
    level: Optional[str] = None,
    competency_code: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """Browse the course catalog (50 synthetic courses)."""
    query = db.query(Course)
    if provider_type:
        query = query.filter(Course.provider_type == provider_type)
    if level:
        query = query.filter(Course.level == level)

    if competency_code:
        query = query.join(CourseCompetency, Course.id == CourseCompetency.course_id).join(
            Competency, CourseCompetency.competency_id == Competency.id
        ).filter(Competency.code == competency_code.upper())

    courses = query.order_by(Course.title).all()

    result = []
    for c in courses:
        comps = (
            db.query(Competency)
            .join(CourseCompetency, Competency.id == CourseCompetency.competency_id)
            .filter(CourseCompetency.course_id == c.id)
            .all()
        )
        result.append({
            "id": c.id,
            "title": c.title,
            "provider_type": c.provider_type,
            "provider_name": c.provider_name,
            "delivery_mode": c.delivery_mode,
            "level": c.level,
            "duration_hours": float(c.duration_hours or 0),
            "modules_count": c.modules_count,
            "has_final_assessment": c.has_final_assessment,
            "price": c.price,
            "competencies": [{"code": comp.code, "name": comp.name} for comp in comps],
        })

    return result
