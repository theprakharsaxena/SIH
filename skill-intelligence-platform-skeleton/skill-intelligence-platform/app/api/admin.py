"""
Admin API Router — Workforce analytics, competency heatmap, and Workforce Readiness Score.
"""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Official, Role, Competency, CompetencyScore, Course, Enrollment, AssessmentResult

router = APIRouter(prefix="/admin", tags=["Admin & Analytics"])


@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    """System-wide summary metrics."""
    total_officers = db.query(Official).count()
    total_competencies = db.query(Competency).count()
    total_roles = db.query(Role).count()
    total_courses = db.query(Course).count()
    total_assessments_taken = db.query(AssessmentResult).count()
    total_enrollments = db.query(Enrollment).count()

    avg_score = db.query(func.avg(CompetencyScore.current_score)).scalar() or 0.0

    return {
        "total_officers": total_officers,
        "total_competencies": total_competencies,
        "total_roles": total_roles,
        "total_courses": total_courses,
        "total_assessments_taken": total_assessments_taken,
        "total_enrollments": total_enrollments,
        "average_workforce_competency_score": round(float(avg_score), 2),
    }


@router.get("/workforce-heatmap")
def get_workforce_heatmap(db: Session = Depends(get_db)):
    """
    Workforce Competency Heatmap.
    Returns average score per competency per role.
    Used for org-wide workforce skill gap analysis dashboard.
    """
    roles = db.query(Role).order_by(Role.code).all()
    competencies = db.query(Competency).order_by(Competency.code).all()

    # Query average scores grouped by (role_code, competency_code)
    avg_scores_query = (
        db.query(Role.code.label("role_code"), Competency.code.label("comp_code"), func.avg(CompetencyScore.current_score).label("avg_score"))
        .join(Official, Official.role_id == Role.id)
        .join(CompetencyScore, CompetencyScore.official_id == Official.id)
        .join(Competency, CompetencyScore.competency_id == Competency.id)
        .group_by(Role.code, Competency.code)
        .all()
    )

    lookup = {(r.role_code, r.comp_code): round(float(r.avg_score), 2) for r in avg_scores_query}

    role_codes = [r.code for r in roles]
    matrix = []

    for c in competencies:
        row = {
            "competency_code": c.code,
            "competency_name": c.name,
            "domain_category": c.domain_category,
        }
        for r_code in role_codes:
            row[r_code] = lookup.get((r_code, c.code), 0.0)
        matrix.append(row)

    return {
        "roles": [{"code": r.code, "name": r.name} for r in roles],
        "competency_matrix": matrix,
    }


@router.get("/workforce-readiness")
def get_workforce_readiness_score(db: Session = Depends(get_db)):
    """
    Workforce Readiness Score.
    The headline demo metric (e.g. 67% Overall Readiness across Statistical, Technical, GIS, etc.).
    """
    categories = ["Statistical", "Technical", "Digital Governance", "Behavioural & Managerial"]

    domain_scores = []
    for cat in categories:
        avg_score = (
            db.query(func.avg(CompetencyScore.current_score))
            .join(Competency, CompetencyScore.competency_id == Competency.id)
            .filter(Competency.domain_category == cat)
            .scalar()
        ) or 2.5  # default baseline if no evidence yet

        # Readiness percentage = avg score (0-5) / 5 * 100
        pct = round((float(avg_score) / 5.0) * 100, 1)
        domain_scores.append({
            "domain_category": cat,
            "avg_score_out_of_5": round(float(avg_score), 2),
            "readiness_percentage": pct,
        })

    overall_readiness = round(sum(d["readiness_percentage"] for d in domain_scores) / len(domain_scores), 1)

    return {
        "overall_workforce_readiness_pct": overall_readiness,
        "domain_breakdown": domain_scores,
        "target_role_simulations": [
            {
                "target_role": "Senior Statistical Analyst (SSO)",
                "current_workforce_readiness": 68.5,
                "missing_key_skills": [
                    {"code": "TC-07", "name": "GIS", "status": "Critical Gap"},
                    {"code": "TC-09", "name": "AI/ML", "status": "Critical Gap"},
                    {"code": "OS-10", "name": "Data Quality Frameworks", "status": "Moderate Gap"},
                ]
            }
        ]
    }
