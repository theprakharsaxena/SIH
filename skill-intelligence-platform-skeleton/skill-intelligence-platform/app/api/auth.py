"""
Auth router — simple JWT authentication for demo purposes.
Supports mock login and token creation.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES
from app.db.session import get_db
from app.db.models import Official

router = APIRouter(prefix="/auth", tags=["Auth"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


class Token(BaseModel):
    access_token: str
    token_type: str
    official_id: Optional[str] = None
    role_code: Optional[str] = None
    full_name: Optional[str] = None


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=JWT_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login endpoint. Checks email/username against DB officials.
    If official doesn't exist, auto-creates a demo officer for easy hackathon demoing.
    """
    official = db.query(Official).filter(
        (Official.email == form_data.username) | (Official.full_name == form_data.username)
    ).first()

    if not official:
        # For seamless hackathon demo, if user doesn't exist, create a default demo official
        from app.db.models import Role
        default_role = db.query(Role).filter_by(code="SSO").first()
        role_id = default_role.id if default_role else None
        
        official = Official(
            full_name=form_data.username,
            email=f"{form_data.username.lower().replace(' ', '.')}@mospi.gov.in",
            designation="Senior Statistical Officer",
            department="MoSPI - DIID",
            role_id=role_id,
            auth_source_system="mock"
        )
        db.add(official)
        db.commit()
        db.refresh(official)

    role_code = official.role.code if official.role else "SSO"

    token = create_access_token(data={"sub": official.id, "email": official.email, "role": role_code})

    return Token(
        access_token=token,
        token_type="bearer",
        official_id=official.id,
        role_code=role_code,
        full_name=official.full_name,
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
