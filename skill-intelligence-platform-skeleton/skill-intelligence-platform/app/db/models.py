"""SQLAlchemy ORM models — mirrors db/schema.sql exactly."""
import uuid
from datetime import datetime, timezone
from typing import Optional

from pgvector.sqlalchemy import Vector
from sqlalchemy import (
    Boolean, CheckConstraint, DateTime, ForeignKey,
    Integer, Numeric, String, Text, UniqueConstraint,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


def _uuid():
    return str(uuid.uuid4())


def _now():
    return datetime.now(timezone.utc)


# ─────────────────────────────────────────────────────────────────────────────
# COMPETENCY LAYER
# ─────────────────────────────────────────────────────────────────────────────

class Competency(Base):
    __tablename__ = "competencies"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    competency_type: Mapped[str] = mapped_column(
        String,
        CheckConstraint("competency_type IN ('behavioural','functional','domain')"),
        nullable=False,
    )
    domain_category: Mapped[Optional[str]] = mapped_column(Text)
    kcm_mapping_code: Mapped[Optional[str]] = mapped_column(Text)
    ps_mandated: Mapped[bool] = mapped_column(Boolean, default=False)
    source_status: Mapped[str] = mapped_column(String, default="prototype")
    source_note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    role_requirements: Mapped[list["RoleCompetencyRequirement"]] = relationship(back_populates="competency")
    course_competencies: Mapped[list["CourseCompetency"]] = relationship(back_populates="competency")
    evidence_items: Mapped[list["CompetencyEvidence"]] = relationship(back_populates="competency")
    scores: Mapped[list["CompetencyScore"]] = relationship(back_populates="competency")


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    code: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    service_stage: Mapped[Optional[str]] = mapped_column(Text)
    description: Mapped[Optional[str]] = mapped_column(Text)
    source_note: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    requirements: Mapped[list["RoleCompetencyRequirement"]] = relationship(back_populates="role")
    officials: Mapped[list["Official"]] = relationship(back_populates="role")


class RoleCompetencyRequirement(Base):
    __tablename__ = "role_competency_requirements"
    __table_args__ = (UniqueConstraint("role_id", "competency_id"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    required_level: Mapped[float] = mapped_column(Numeric(3, 1), nullable=False)
    priority: Mapped[str] = mapped_column(String, default="standard")
    source_status: Mapped[str] = mapped_column(String, default="prototype")

    role: Mapped["Role"] = relationship(back_populates="requirements")
    competency: Mapped["Competency"] = relationship(back_populates="role_requirements")


# ─────────────────────────────────────────────────────────────────────────────
# OFFICIALS
# ─────────────────────────────────────────────────────────────────────────────

class Official(Base):
    __tablename__ = "officials"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    full_name: Mapped[str] = mapped_column(Text, nullable=False)
    designation: Mapped[Optional[str]] = mapped_column(Text)
    role_id: Mapped[Optional[str]] = mapped_column(ForeignKey("roles.id"))
    department: Mapped[Optional[str]] = mapped_column(Text)
    email: Mapped[Optional[str]] = mapped_column(Text, unique=True)
    phone: Mapped[Optional[str]] = mapped_column(Text)
    auth_source_system: Mapped[str] = mapped_column(String, default="mock")
    external_auth_id: Mapped[Optional[str]] = mapped_column(Text)
    hashed_password: Mapped[Optional[str]] = mapped_column(Text)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    years_experience: Mapped[Optional[int]] = mapped_column(Integer)
    highest_qualification: Mapped[Optional[str]] = mapped_column(Text)
    field_of_study: Mapped[Optional[str]] = mapped_column(Text)
    university: Mapped[Optional[str]] = mapped_column(Text)
    graduation_year: Mapped[Optional[int]] = mapped_column(Integer)
    onboarding_complete: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    role: Mapped[Optional["Role"]] = relationship(back_populates="officials")
    evidence_items: Mapped[list["CompetencyEvidence"]] = relationship(back_populates="official")
    scores: Mapped[list["CompetencyScore"]] = relationship(back_populates="official")
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="official")
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="official")
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="official")


class CompetencyEvidence(Base):
    __tablename__ = "competency_evidence"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    evidence_type: Mapped[str] = mapped_column(
        String,
        CheckConstraint("evidence_type IN ('education','experience','prior_training','assessment','self_report')"),
        nullable=False,
    )
    raw_fact: Mapped[dict] = mapped_column(JSONB, nullable=False)
    raw_score: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))
    weight_applied: Mapped[Optional[float]] = mapped_column(Numeric(4, 3))
    extracted_by: Mapped[str] = mapped_column(String, default="llm")
    source_reference: Mapped[Optional[str]] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    official: Mapped["Official"] = relationship(back_populates="evidence_items")
    competency: Mapped["Competency"] = relationship(back_populates="evidence_items")


class CompetencyScore(Base):
    __tablename__ = "competency_scores"
    __table_args__ = (UniqueConstraint("official_id", "competency_id"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    current_score: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    confidence: Mapped[Optional[float]] = mapped_column(Numeric(3, 2))
    computed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    official: Mapped["Official"] = relationship(back_populates="scores")
    competency: Mapped["Competency"] = relationship(back_populates="scores")


# ─────────────────────────────────────────────────────────────────────────────
# COURSE CATALOG
# ─────────────────────────────────────────────────────────────────────────────

class Course(Base):
    __tablename__ = "courses"
    __table_args__ = (UniqueConstraint("source_system", "external_id"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    source_system: Mapped[str] = mapped_column(String, default="mock")
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    title: Mapped[str] = mapped_column(Text, nullable=False)
    provider_type: Mapped[str] = mapped_column(String, nullable=False)
    provider_name: Mapped[Optional[str]] = mapped_column(Text)
    delivery_mode: Mapped[Optional[str]] = mapped_column(String)
    level: Mapped[Optional[str]] = mapped_column(String)
    duration_hours: Mapped[Optional[float]] = mapped_column(Numeric(5, 1))
    modules_count: Mapped[Optional[int]] = mapped_column(Integer)
    has_final_assessment: Mapped[bool] = mapped_column(Boolean, default=True)
    practice_tests_count: Mapped[int] = mapped_column(Integer, default=0)
    price: Mapped[str] = mapped_column(Text, default="Free")
    license: Mapped[Optional[str]] = mapped_column(Text)
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    course_competencies: Mapped[list["CourseCompetency"]] = relationship(back_populates="course", cascade="all, delete-orphan")
    embedding: Mapped[Optional["CourseEmbedding"]] = relationship(back_populates="course", uselist=False)
    enrollments: Mapped[list["Enrollment"]] = relationship(back_populates="course")
    recommendations: Mapped[list["Recommendation"]] = relationship(back_populates="course")


class CourseCompetency(Base):
    __tablename__ = "course_competencies"

    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id", ondelete="CASCADE"), primary_key=True)

    course: Mapped["Course"] = relationship(back_populates="course_competencies")
    competency: Mapped["Competency"] = relationship(back_populates="course_competencies")


class CourseEmbedding(Base):
    __tablename__ = "course_embeddings"

    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), primary_key=True)
    embedding: Mapped[list[float]] = mapped_column(Vector(1536))

    course: Mapped["Course"] = relationship(back_populates="embedding")


class ExternalCompetencyCrosswalk(Base):
    __tablename__ = "external_competency_crosswalk"
    __table_args__ = (UniqueConstraint("source_system", "external_competency_code"),)

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    source_system: Mapped[str] = mapped_column(String, nullable=False)
    external_competency_code: Mapped[str] = mapped_column(Text, nullable=False)
    external_competency_name: Mapped[Optional[str]] = mapped_column(Text)
    mapped_competency_id: Mapped[Optional[str]] = mapped_column(ForeignKey("competencies.id"))
    mapping_status: Mapped[str] = mapped_column(String, default="unmapped")


# ─────────────────────────────────────────────────────────────────────────────
# ENROLLMENT
# ─────────────────────────────────────────────────────────────────────────────

class Enrollment(Base):
    __tablename__ = "enrollments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    source_system: Mapped[str] = mapped_column(String, default="mock")
    external_id: Mapped[Optional[str]] = mapped_column(Text)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    status: Mapped[str] = mapped_column(String, default="enrolled")
    enrolled_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True))
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    official: Mapped["Official"] = relationship(back_populates="enrollments")
    course: Mapped["Course"] = relationship(back_populates="enrollments")


# ─────────────────────────────────────────────────────────────────────────────
# RECOMMENDATIONS
# ─────────────────────────────────────────────────────────────────────────────

class Recommendation(Base):
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    course_id: Mapped[str] = mapped_column(ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id"), nullable=False)
    gap_at_time: Mapped[float] = mapped_column(Numeric(3, 2), nullable=False)
    score: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    score_breakdown: Mapped[Optional[dict]] = mapped_column(JSONB)
    reason_text: Mapped[Optional[str]] = mapped_column(Text)
    generated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    official: Mapped["Official"] = relationship(back_populates="recommendations")
    course: Mapped["Course"] = relationship(back_populates="recommendations")


# ─────────────────────────────────────────────────────────────────────────────
# ASSESSMENT ENGINE
# ─────────────────────────────────────────────────────────────────────────────

class UploadedMaterial(Base):
    __tablename__ = "uploaded_materials"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    uploaded_by: Mapped[Optional[str]] = mapped_column(ForeignKey("officials.id"))
    filename: Mapped[str] = mapped_column(Text, nullable=False)
    competency_id: Mapped[Optional[str]] = mapped_column(ForeignKey("competencies.id"))
    storage_path: Mapped[str] = mapped_column(Text, nullable=False)
    uploaded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    assessments: Mapped[list["Assessment"]] = relationship(back_populates="source_material")


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    competency_id: Mapped[str] = mapped_column(ForeignKey("competencies.id"), nullable=False)
    source_material_id: Mapped[Optional[str]] = mapped_column(ForeignKey("uploaded_materials.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    official: Mapped["Official"] = relationship(back_populates="assessments")
    source_material: Mapped[Optional["UploadedMaterial"]] = relationship(back_populates="assessments")
    questions: Mapped[list["AssessmentQuestion"]] = relationship(back_populates="assessment", cascade="all, delete-orphan")
    results: Mapped[list["AssessmentResult"]] = relationship(back_populates="assessment")


class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    options: Mapped[dict] = mapped_column(JSONB, nullable=False)
    correct_option_id: Mapped[str] = mapped_column(String, nullable=False)
    explanation: Mapped[Optional[str]] = mapped_column(Text)
    difficulty: Mapped[Optional[str]] = mapped_column(String)
    source_excerpt_ref: Mapped[Optional[str]] = mapped_column(Text)

    assessment: Mapped["Assessment"] = relationship(back_populates="questions")


class AssessmentResult(Base):
    __tablename__ = "assessment_results"

    id: Mapped[str] = mapped_column(UUID(as_uuid=False), primary_key=True, default=_uuid)
    assessment_id: Mapped[str] = mapped_column(ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    official_id: Mapped[str] = mapped_column(ForeignKey("officials.id", ondelete="CASCADE"), nullable=False)
    score_percent: Mapped[float] = mapped_column(Numeric(5, 2), nullable=False)
    completed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_now)

    assessment: Mapped["Assessment"] = relationship(back_populates="results")
