"""
Domain dataclasses — pure Python, no DB, no I/O.
These flow through evidence_scorer -> gap_engine -> recommendation_engine.
"""
from dataclasses import dataclass, field
from typing import Optional


# ─── Evidence inputs ──────────────────────────────────────────────────────────

@dataclass
class AssessmentEvidence:
    """A diagnostic or post-course test score."""
    test_percent: float              # 0-100
    competency_code: str
    source_reference: Optional[str] = None


@dataclass
class ExperienceEvidence:
    """Work experience for a competency area."""
    years: float
    relevance: str                   # 'direct' | 'adjacent' | 'tangential' | 'unrelated'
    competency_code: str
    source_reference: Optional[str] = None


@dataclass
class TrainingEvidence:
    """A completed iGOT/NSSTA course."""
    course_level: str                # 'none' | 'beginner' | 'intermediate' | 'advanced'
    passed_assessment: bool
    competency_code: str
    course_title: Optional[str] = None
    source_reference: Optional[str] = None


@dataclass
class EducationEvidence:
    """Educational qualification for a competency."""
    education_score: float           # 1-5 directly (see rules in evidence_scorer.py)
    competency_code: str
    degree: Optional[str] = None
    field: Optional[str] = None


@dataclass
class SelfReportEvidence:
    """Self-declared competency level."""
    self_score: float                # 1-5 direct pass-through
    competency_code: str


# ─── Officer profile ──────────────────────────────────────────────────────────

@dataclass
class OfficerProfile:
    """
    Structured representation of an officer's profile.
    The LLM (profile_extractor.py) produces this from an unstructured CV.
    The evidence_scorer converts this into competency scores.
    """
    officer_id: str
    role_code: str                                    # 'JSO' | 'SSO' | 'MCTP-II' | 'MCTP-III'

    assessments: list[AssessmentEvidence] = field(default_factory=list)
    experiences: list[ExperienceEvidence] = field(default_factory=list)
    trainings: list[TrainingEvidence] = field(default_factory=list)
    education: list[EducationEvidence] = field(default_factory=list)
    self_reports: list[SelfReportEvidence] = field(default_factory=list)


# ─── Scoring outputs ──────────────────────────────────────────────────────────

@dataclass
class CompetencyScoreBreakdown:
    """
    Full breakdown of how a 0-5 competency score was computed.
    Every score is explainable — no opaque AI outputs.
    """
    competency_code: str
    final_score: float                               # 0-5

    # Per-component raw scores (0-5 each)
    assessment_raw: Optional[float] = None
    experience_raw: Optional[float] = None
    training_raw: Optional[float] = None
    education_raw: Optional[float] = None
    self_report_raw: Optional[float] = None

    # Weighted contributions (raw x weight)
    assessment_contribution: float = 0.0
    experience_contribution: float = 0.0
    training_contribution: float = 0.0
    education_contribution: float = 0.0
    self_report_contribution: float = 0.0

    def explanation(self) -> str:
        """Human-readable score breakdown for display/audit."""
        parts = []
        w = {
            "Assessment": (self.assessment_raw, 0.30, self.assessment_contribution),
            "Experience":  (self.experience_raw, 0.25, self.experience_contribution),
            "Training":    (self.training_raw,   0.20, self.training_contribution),
            "Education":   (self.education_raw,  0.15, self.education_contribution),
            "Self-report": (self.self_report_raw, 0.10, self.self_report_contribution),
        }
        for label, (raw, weight, contrib) in w.items():
            if raw is not None:
                parts.append(f"{label}: {raw:.1f} × {weight:.2f} = {contrib:.2f}")
        parts.append(f"Total: {self.final_score:.2f}/5")
        return " | ".join(parts)


# ─── Gap output ───────────────────────────────────────────────────────────────

GAP_CATEGORY_A = "A"   # Gap <= 0      — no/minimal gap
GAP_CATEGORY_B = "B"   # Gap 0 – 1.5   — slight gap
GAP_CATEGORY_C = "C"   # Gap > 1.5     — considerable gap, prioritize


@dataclass
class CompetencyGap:
    competency_code: str
    competency_name: str
    current_score: float
    required_score: float
    gap: float                      # required - current (negative = exceeds requirement)
    category: str                   # A | B | C
    priority: str                   # critical | standard | nice_to_have
    score_breakdown: Optional[CompetencyScoreBreakdown] = None


@dataclass
class GapReport:
    officer_id: str
    role_code: str
    gaps: list[CompetencyGap] = field(default_factory=list)

    @property
    def critical_gaps(self) -> list[CompetencyGap]:
        return [g for g in self.gaps if g.category == GAP_CATEGORY_C]

    @property
    def slight_gaps(self) -> list[CompetencyGap]:
        return [g for g in self.gaps if g.category == GAP_CATEGORY_B]

    @property
    def overall_readiness_pct(self) -> float:
        """Percentage of required competency currently met, averaged across all."""
        if not self.gaps:
            return 0.0
        scores = []
        for g in self.gaps:
            if g.required_score > 0:
                scores.append(min(g.current_score / g.required_score, 1.0))
        return round(sum(scores) / len(scores) * 100, 1) if scores else 0.0


# ─── Recommendation output ────────────────────────────────────────────────────

@dataclass
class CourseRecommendation:
    course_id: str
    course_title: str
    provider_type: str              # iGOT | NSSTA
    delivery_mode: str
    level: str                      # Beginner | Intermediate | Advanced
    duration_hours: float
    competency_code: str
    competency_name: str
    gap_addressed: float
    relevance_score: float          # 0-1 overall ranking score
    score_breakdown: dict           # {role_match, gap_size, level_match, priority, history}
    reason_text: str                # "Recommended because..."
