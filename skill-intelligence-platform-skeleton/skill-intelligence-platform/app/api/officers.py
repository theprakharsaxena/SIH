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
    department: Optional[str] = ""
    designation: Optional[str] = ""
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
    Returns structured JSON of evidence and AI alignment evaluation.
    """
    try:
        profile, alignment_warning = extract_profile(
            officer_id=payload.officer_id or "temp-id",
            role_code=payload.role_code or "SSO",
            profile_text=payload.profile_text,
            department=payload.department or "",
            designation=payload.designation or "",
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profile extraction failed: {str(e)}")

    return {
        "officer_id": profile.officer_id,
        "role_code": profile.role_code,
        "is_aligned": alignment_warning is None,
        "alignment_warning": alignment_warning,
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


@router.get("/{officer_id}/progress-history")
def get_officer_progress_history(officer_id: str, db: Session = Depends(get_db)):
    """
    Returns time-series history of competency evidence updates for the specified officer.
    Powers Tab 4 (Progress Over Time) line charts on the Learner Dashboard.
    """
    from app.db.models import CompetencyEvidence
    evidence_rows = (
        db.query(CompetencyEvidence)
        .filter_by(official_id=officer_id)
        .order_by(CompetencyEvidence.created_at.asc())
        .all()
    )

    comp_map = {}
    for ev in evidence_rows:
        c_code = ev.competency.code if ev.competency else "COMP"
        c_name = ev.competency.name if ev.competency else "Competency"
        if c_code not in comp_map:
            comp_map[c_code] = {
                "competency_code": c_code,
                "competency_name": c_name,
                "history": []
            }
        comp_map[c_code]["history"].append({
            "timestamp": ev.created_at.isoformat() if ev.created_at else None,
            "evidence_type": ev.evidence_type,
            "raw_score": float(ev.raw_score) if ev.raw_score is not None else 0.0,
            "source": ev.source_reference or ev.extracted_by,
        })

    return {"progress_history": list(comp_map.values())}

