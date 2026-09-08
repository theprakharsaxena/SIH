"""
Auth router — JWT-based authentication for Learner and Admin portals.
Supports: register (with onboarding data), login, me endpoint.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from app.db.session import get_db
from app.db.models import Official, Role

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ─── Schemas ─────────────────────────────────────────────────────────────────

class Token(BaseModel):
    access_token: str
    token_type: str
    official_id: Optional[str] = None
    role_code: Optional[str] = None
    full_name: Optional[str] = None
    is_admin: Optional[bool] = False
    onboarding_complete: Optional[bool] = False


class RegisterRequest(BaseModel):
    full_name: str
    email: str
    password: str
    role_code: Optional[str] = "JSO"
    department: Optional[str] = None
    designation: Optional[str] = None
    phone: Optional[str] = None
    years_experience: Optional[int] = None
    highest_qualification: Optional[str] = None
    field_of_study: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    profile_text: Optional[str] = None  # Step 4 work experience text


class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    years_experience: Optional[int] = None
    highest_qualification: Optional[str] = None
    field_of_study: Optional[str] = None
    university: Optional[str] = None
    graduation_year: Optional[int] = None
    profile_text: Optional[str] = None
    role_code: Optional[str] = None


class OfficerMeResponse(BaseModel):
    id: str
    full_name: str
    email: Optional[str]
    designation: Optional[str]
    department: Optional[str]
    phone: Optional[str]
    role_code: Optional[str]
    role_name: Optional[str]
    is_admin: bool
    onboarding_complete: bool
    years_experience: Optional[int]
    highest_qualification: Optional[str]
    field_of_study: Optional[str]
    university: Optional[str]
    graduation_year: Optional[int]
    created_at: Optional[str]


# ─── Helpers ─────────────────────────────────────────────────────────────────

def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain[:72], hashed)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


# ─── Endpoints ───────────────────────────────────────────────────────────────

@router.post("/register", response_model=Token, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    """
    Register a new learner / official.
    Creates the official record from onboarding wizard data.
    """
    # Check email uniqueness
    if db.query(Official).filter_by(email=payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered.")

    # Resolve role
    role = db.query(Role).filter_by(code=payload.role_code).first()
    if not role:
        role = db.query(Role).filter_by(code="JSO").first()

    official = Official(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role_id=role.id if role else None,
        department=payload.department,
        designation=payload.designation or (role.name if role else "Officer"),
        phone=payload.phone,
        years_experience=payload.years_experience,
        highest_qualification=payload.highest_qualification,
        field_of_study=payload.field_of_study,
        university=payload.university,
        graduation_year=payload.graduation_year,
        auth_source_system="local",
        onboarding_complete=True,
        is_admin=False,
    )
    db.add(official)
    db.commit()
    db.refresh(official)

    # If profile text provided, trigger AI extraction async-style (best effort)
    if payload.profile_text:
        try:
            from app.services.gap_service import refresh_officer_gap
            refresh_officer_gap(
                db=db,
                official_id=official.id,
                role_code=payload.role_code or "JSO",
                profile_text=payload.profile_text,
            )
        except Exception:
            pass  # Non-blocking; user still gets their account

    role_code = role.code if role else "JSO"
    token = create_access_token(data={
        "sub": official.id,
        "email": official.email,
        "role": role_code,
        "is_admin": False,
    })

    return Token(
        access_token=token,
        token_type="bearer",
        official_id=official.id,
        role_code=role_code,
        full_name=official.full_name,
        is_admin=False,
        onboarding_complete=True,
    )


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login with email + password.
    Works for both learners (is_admin=False) and admins (is_admin=True).
    Falls back to legacy mock auto-create for demo officials without passwords.
    """
    official = db.query(Official).filter(
        (Official.email == form_data.username) | (Official.full_name == form_data.username)
    ).first()

    if not official:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account not found. Please register first.",
        )

    # If official has a hashed password, verify it
    if official.hashed_password:
        if not verify_password(form_data.password, official.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect password.",
            )
    # else: legacy/seeded demo officials without password — allow for demo mode

    role_code = official.role.code if official.role else "SSO"
    token = create_access_token(data={
        "sub": official.id,
        "email": official.email,
        "role": role_code,
        "is_admin": official.is_admin,
    })

    return Token(
        access_token=token,
        token_type="bearer",
        official_id=official.id,
        role_code=role_code,
        full_name=official.full_name,
        is_admin=official.is_admin,
        onboarding_complete=official.onboarding_complete,
    )


@router.get("/me", response_model=OfficerMeResponse)
def get_me(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """Return the currently authenticated user's profile."""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        official_id: str = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    official = db.query(Official).filter_by(id=official_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="User not found.")

    role_code = official.role.code if official.role else None
    role_name = official.role.name if official.role else None

    return OfficerMeResponse(
        id=official.id,
        full_name=official.full_name,
        email=official.email,
        designation=official.designation,
        department=official.department,
        phone=getattr(official, "phone", None),
        role_code=role_code,
        role_name=role_name,
        is_admin=official.is_admin or False,
        onboarding_complete=official.onboarding_complete or False,
        years_experience=getattr(official, "years_experience", None),
        highest_qualification=getattr(official, "highest_qualification", None),
        field_of_study=getattr(official, "field_of_study", None),
        university=getattr(official, "university", None),
        graduation_year=getattr(official, "graduation_year", None),
        created_at=official.created_at.isoformat() if official.created_at else None,
    )


@router.put("/me", response_model=OfficerMeResponse)
def update_me(
    payload: ProfileUpdateRequest,
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Update current user's profile fields."""
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated.")
    try:
        jwt_payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        official_id: str = jwt_payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token.")

    official = db.query(Official).filter_by(id=official_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="User not found.")

    update_fields = payload.model_dump(exclude_none=True)
    role_code = update_fields.pop("role_code", None)
    profile_text = update_fields.pop("profile_text", None)

    for field, value in update_fields.items():
        setattr(official, field, value)

    if role_code:
        role = db.query(Role).filter_by(code=role_code).first()
        if role:
            official.role_id = role.id

    db.commit()
    db.refresh(official)

    # Trigger profile re-analysis if text provided
    if profile_text:
        try:
            from app.services.gap_service import refresh_officer_gap
            refresh_officer_gap(
                db=db,
                official_id=official.id,
                role_code=role_code or (official.role.code if official.role else "SSO"),
                profile_text=profile_text,
            )
        except Exception:
            pass

    role_code_out = official.role.code if official.role else None
    return OfficerMeResponse(
        id=official.id,
        full_name=official.full_name,
        email=official.email,
        designation=official.designation,
        department=official.department,
        phone=getattr(official, "phone", None),
        role_code=role_code_out,
        role_name=official.role.name if official.role else None,
        is_admin=official.is_admin or False,
        onboarding_complete=official.onboarding_complete or False,
        years_experience=getattr(official, "years_experience", None),
        highest_qualification=getattr(official, "highest_qualification", None),
        field_of_study=getattr(official, "field_of_study", None),
        university=getattr(official, "university", None),
        graduation_year=getattr(official, "graduation_year", None),
        created_at=official.created_at.isoformat() if official.created_at else None,
    )


def get_current_official(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[Official]:
    """Dependency to extract authenticated official from token (optional for demo endpoints)."""
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        official_id: str = payload.get("sub")
        if official_id is None:
            return None
        return db.query(Official).filter_by(id=official_id).first()
    except JWTError:
        return None
