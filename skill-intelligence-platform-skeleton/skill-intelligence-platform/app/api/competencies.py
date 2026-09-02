"""
Competencies and Roles API Router — access competency framework and role requirements.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Competency, Role, RoleCompetencyRequirement, CourseCompetency, Course

router = APIRouter(tags=["Competencies & Roles"])


@router.get("/competencies")
def list_competencies(category: Optional[str] = None, db: Session = Depends(get_db)):
    """List all competencies, optionally filtered by domain category."""
    query = db.query(Competency)
    if category:
        query = query.filter(Competency.domain_category == category)
    competencies = query.order_by(Competency.code).all()

    return [
        {
            "id": c.id,
            "code": c.code,
            "name": c.name,
            "competency_type": c.competency_type,
            "domain_category": c.domain_category,
            "kcm_mapping_code": c.kcm_mapping_code,
            "ps_mandated": c.ps_mandated,
            "source_status": c.source_status,
            "source_note": c.source_note,
        }
        for c in competencies
    ]


@router.get("/competencies/{code}")
def get_competency_by_code(code: str, db: Session = Depends(get_db)):
    """Get single competency details and associated courses."""
    comp = db.query(Competency).filter_by(code=code.upper()).first()
    if not comp:
        raise HTTPException(status_code=404, detail=f"Competency '{code}' not found")

    courses = (
        db.query(Course)
        .join(CourseCompetency, Course.id == CourseCompetency.course_id)
        .filter(CourseCompetency.competency_id == comp.id)
        .all()
    )

    reqs = (
        db.query(RoleCompetencyRequirement, Role)
        .join(Role, RoleCompetencyRequirement.role_id == Role.id)
        .filter(RoleCompetencyRequirement.competency_id == comp.id)
        .all()
    )

    return {
        "id": comp.id,
        "code": comp.code,
        "name": comp.name,
        "domain_category": comp.domain_category,
        "kcm_mapping_code": comp.kcm_mapping_code,
        "ps_mandated": comp.ps_mandated,
        "source_note": comp.source_note,
        "required_by_roles": [
            {
                "role_code": r.code,
                "role_name": r.name,
                "required_level": float(req.required_level),
                "priority": req.priority,
            }
            for req, r in reqs
        ],
        "mapped_courses": [
            {
                "course_id": c.id,
                "title": c.title,
                "provider_type": c.provider_type,
                "level": c.level,
                "duration_hours": float(c.duration_hours or 0),
            }
            for c in courses
        ],
    }


@router.get("/roles")
def list_roles(db: Session = Depends(get_db)):
    """List all 4 roles and their descriptions."""
    roles = db.query(Role).order_by(Role.code).all()
    return [
        {
            "id": r.id,
            "code": r.code,
            "name": r.name,
            "service_stage": r.service_stage,
            "description": r.description,
            "source_note": r.source_note,
        }
        for r in roles
    ]


@router.get("/roles/{code}/requirements")
def get_role_requirements(code: str, db: Session = Depends(get_db)):
    """Get required competency levels for a specific role."""
    role = db.query(Role).filter_by(code=code.upper()).first()
    if not role:
        raise HTTPException(status_code=404, detail=f"Role '{code}' not found")

    reqs = (
        db.query(RoleCompetencyRequirement, Competency)
        .join(Competency, RoleCompetencyRequirement.competency_id == Competency.id)
        .filter(RoleCompetencyRequirement.role_id == role.id)
        .order_by(Competency.code)
        .all()
    )

    return {
        "role_code": role.code,
        "role_name": role.name,
        "requirements": [
            {
                "competency_code": c.code,
                "competency_name": c.name,
                "domain_category": c.domain_category,
                "required_level": float(req.required_level),
                "priority": req.priority,
            }
            for req, c in reqs
        ],
    }
