"""
Officers API Router — manage official profiles and extract evidence via LLM.
"""
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.db.models import Official, Role, CompetencyScore, Competency
from app.domain.profile_extractor import extract_profile, DEMO_PROFILE_TEXT
from app.domain.mcq_engine import generate_diagnostic_quiz
from app.domain.models import OfficerProfile

router = APIRouter(prefix="/officers", tags=["Officers"])


class OfficerCreate(BaseModel):
    full_name: str
    designation: Optional[str] = "Senior Statistical Officer"
    role_code: Optional[str] = "SSO"
    department: Optional[str] = "MoSPI"
    email: Optional[str] = None


class ProfileExtractRequest(BaseModel):
    officer_id: Optional[str] = None
    role_code: Optional[str] = "SSO"
    profile_text: str


class DiagnosticQuizRequest(BaseModel):
    role_code: Optional[str] = "JSO"
    department: Optional[str] = ""
    designation: Optional[str] = ""
    profile_text: Optional[str] = ""


@router.post("", status_code=status.HTTP_201_CREATED)
def create_officer(payload: OfficerCreate, db: Session = Depends(get_db)):
    """Create a new official profile."""
    role = db.query(Role).filter_by(code=payload.role_code).first()
    if not role and payload.role_code:
        raise HTTPException(status_code=400, detail=f"Role '{payload.role_code}' not found")

    email = payload.email or f"{payload.full_name.lower().replace(' ', '.')}@mospi.gov.in"
    existing = db.query(Official).filter_by(email=email).first()
    if existing:
        return {
            "id": existing.id,
            "full_name": existing.full_name,
            "role_code": existing.role.code if existing.role else "SSO",
            "message": "Officer already exists",
        }

    official = Official(
        full_name=payload.full_name,
        designation=payload.designation,
        role_id=role.id if role else None,
        department=payload.department,
        email=email,
        auth_source_system="mock",
    )
    db.add(official)
    db.commit()
    db.refresh(official)

    return {
        "id": official.id,
        "full_name": official.full_name,
        "designation": official.designation,
        "role_code": payload.role_code,
        "email": official.email,
    }


@router.get("")
def list_officers(db: Session = Depends(get_db)):
    """List all registered officers."""
    officers = db.query(Official).all()
    return [
        {
            "id": o.id,
            "full_name": o.full_name,
            "designation": o.designation,
            "department": o.department,
            "role_code": o.role.code if o.role else None,
            "email": o.email,
        }
        for o in officers
    ]


@router.get("/demo-profile")
def get_demo_profile():
    """Return sample demo profile text for quick frontend testing."""
    return {"sample_text": DEMO_PROFILE_TEXT}


@router.get("/{officer_id}")
def get_officer(officer_id: str, db: Session = Depends(get_db)):
    """Get official details including current competency scores."""
    official = db.query(Official).filter_by(id=officer_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="Officer not found")

    scores = (
        db.query(CompetencyScore, Competency)
        .join(Competency, CompetencyScore.competency_id == Competency.id)
        .filter(CompetencyScore.official_id == officer_id)
        .all()
    )

    return {
        "id": official.id,
        "full_name": official.full_name,
        "designation": official.designation,
        "department": official.department,
        "role_code": official.role.code if official.role else "SSO",
        "email": official.email,
        "scores": [
            {
                "competency_code": comp.code,
                "competency_name": comp.name,
                "domain_category": comp.domain_category,
                "current_score": float(sc.current_score),
                "computed_at": sc.computed_at.isoformat() if sc.computed_at else None,
            }
            for sc, comp in scores
        ],
    }


@router.post("/extract-profile")
def extract_officer_profile(payload: ProfileExtractRequest, db: Session = Depends(get_db)):
    """
    Extract structured evidence facts from unstructured free text CV/profile using LLM.
    Returns structured JSON of evidence (assessments, experiences, trainings, education, self-reports).
    """
    try:
        profile: OfficerProfile = extract_profile(
            officer_id=payload.officer_id or "temp-id",
            role_code=payload.role_code or "SSO",
            profile_text=payload.profile_text,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile extraction failed: {str(e)}")

    return {
        "officer_id": profile.officer_id,
        "role_code": profile.role_code,
        "assessments": [e.__dict__ for e in profile.assessments],
        "experiences": [e.__dict__ for e in profile.experiences],
        "trainings": [e.__dict__ for e in profile.trainings],
        "education": [e.__dict__ for e in profile.education],
        "self_reports": [e.__dict__ for e in profile.self_reports],
    }


@router.post("/generate-diagnostic-quiz")
def generate_diagnostic_quiz_endpoint(payload: DiagnosticQuizRequest):
    """
    Generate 5 dynamic diagnostic MCQs based on officer role, department, designation, and CV text.
    """
    questions = generate_diagnostic_quiz(
        role_code=payload.role_code or "JSO",
        department=payload.department or "",
        designation=payload.designation or "",
        profile_text=payload.profile_text or "",
    )
    return {"questions": questions}

