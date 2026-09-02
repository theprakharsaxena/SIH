"""
Evidence Scorer — Pure deterministic functions.
Converts raw evidence facts into 0-5 competency scores using fixed rules.

THE RULE: The LLM extracts raw facts (years worked, test %, degree field).
          These functions convert those facts to scores. The LLM never sets scores.

Weights:
  Assessment    0.30
  Experience    0.25
  Prior Training 0.20
  Education     0.15
  Self-report   0.10

All conversion rules are from Role_Competency_Matrix_and_Scoring_Model_v2.xlsx
→ Sheet: Raw_Score_Conversion_Rules
"""
from app.domain.models import (
    OfficerProfile, CompetencyScoreBreakdown,
    AssessmentEvidence, ExperienceEvidence,
    TrainingEvidence, EducationEvidence, SelfReportEvidence,
)

# ─── Weights (prototype defaults — must sum to 1.0) ────────────────────────────
WEIGHT_ASSESSMENT  = 0.30
WEIGHT_EXPERIENCE  = 0.25
WEIGHT_TRAINING    = 0.20
WEIGHT_EDUCATION   = 0.15
WEIGHT_SELF_REPORT = 0.10

assert abs(WEIGHT_ASSESSMENT + WEIGHT_EXPERIENCE + WEIGHT_TRAINING +
           WEIGHT_EDUCATION + WEIGHT_SELF_REPORT - 1.0) < 1e-9, "Weights must sum to 1.0"


# ─── Rule A: Assessment ────────────────────────────────────────────────────────
# Raw Score = Test percentage / 20
# e.g. 68% → 3.4,  100% → 5.0,  0% → 0.0

def score_assessment(evidence: AssessmentEvidence) -> float:
    """Convert test percentage (0-100) to 0-5 score."""
    return round(min(max(evidence.test_percent / 20.0, 0.0), 5.0), 2)


# ─── Rule B: Work Experience ───────────────────────────────────────────────────
# Years-band lookup × Relevance Factor, capped at 5.
# Years bands: 0-1→1, 1-3→2, 3-6→3, 6-10→4, 10+→5
# Relevance factors: direct=1.0, adjacent=0.6, tangential=0.3, unrelated=0.0

YEARS_BAND = [
    (0,  1,  1),   # (min_exclusive, max_inclusive, score)
    (1,  3,  2),
    (3,  6,  3),
    (6,  10, 4),
    (10, float("inf"), 5),
]

RELEVANCE_FACTOR = {
    "direct":      1.0,
    "adjacent":    0.6,
    "tangential":  0.3,
    "unrelated":   0.0,
}


def _years_score(years: float) -> float:
    for lo, hi, score in YEARS_BAND:
        if lo < years <= hi:
            return float(score)
    return 1.0  # default for 0 years


def score_experience(evidence: ExperienceEvidence) -> float:
    """Convert years + relevance to 0-5 score."""
    relevance_key = evidence.relevance.lower().strip()
    factor = RELEVANCE_FACTOR.get(relevance_key, 0.0)
    base = _years_score(evidence.years)
    return round(min(base * factor, 5.0), 2)


# ─── Rule C: Prior Training ────────────────────────────────────────────────────
# MAX across relevant completed courses.
# no course → 0, completed/no assessment → 2,
# beginner+passed → 3, intermediate+passed → 4, advanced+passed → 5

TRAINING_SCORE = {
    ("none",         False): 0,
    ("none",         True):  0,
    ("beginner",     False): 2,   # completed but no assessment passed
    ("beginner",     True):  3,
    ("intermediate", False): 2,
    ("intermediate", True):  4,
    ("advanced",     False): 2,
    ("advanced",     True):  5,
}


def score_training(evidence: TrainingEvidence) -> float:
    """Convert course level + pass status to 0-5 score."""
    level = evidence.course_level.lower().strip()
    key = (level, evidence.passed_assessment)
    return float(TRAINING_SCORE.get(key, 0))


def score_training_list(evidences: list[TrainingEvidence]) -> float:
    """Return MAX score across all training evidence (as per Rule C)."""
    if not evidences:
        return 0.0
    return max(score_training(e) for e in evidences)


# ─── Rule D: Education ────────────────────────────────────────────────────────
# 1=unrelated, 2=unrelated+relevant coursework, 3=adjacent field bachelor's,
# 4=direct field bachelor's, 5=direct field master's/PhD

def score_education(evidence: EducationEvidence) -> float:
    """Education score is passed directly (1-5). Validation only."""
    return round(min(max(evidence.education_score, 1.0), 5.0), 2)


# ─── Rule E: Self-report ──────────────────────────────────────────────────────
# Direct 1-5 pass-through, no conversion.

def score_self_report(evidence: SelfReportEvidence) -> float:
    """Self-report score is a direct 1-5 pass-through."""
    return round(min(max(evidence.self_score, 1.0), 5.0), 2)


# ─── Combined scorer ──────────────────────────────────────────────────────────

def score_competency(
    competency_code: str,
    assessments: list[AssessmentEvidence] | None = None,
    experiences: list[ExperienceEvidence] | None = None,
    trainings: list[TrainingEvidence] | None = None,
    education: list[EducationEvidence] | None = None,
    self_reports: list[SelfReportEvidence] | None = None,
) -> CompetencyScoreBreakdown:
    """
    Compute the full 0-5 score for a single competency using the 5-factor formula.
    Only factors with actual evidence contribute (absent factors contribute 0).
    Returns a CompetencyScoreBreakdown with full audit trail.
    """
    assessments = assessments or []
    experiences = experiences or []
    trainings = trainings or []
    education = education or []
    self_reports = self_reports or []

    # Filter to this competency
    comp_assessments = [e for e in assessments if e.competency_code == competency_code]
    comp_experiences = [e for e in experiences if e.competency_code == competency_code]
    comp_trainings   = [e for e in trainings   if e.competency_code == competency_code]
    comp_education   = [e for e in education   if e.competency_code == competency_code]
    comp_selfreport  = [e for e in self_reports if e.competency_code == competency_code]

    # Compute raw scores
    # Assessment: take the most recent/highest test score if multiple
    assessment_raw = max((score_assessment(e) for e in comp_assessments), default=None)
    experience_raw = max((score_experience(e) for e in comp_experiences), default=None)
    training_raw   = score_training_list(comp_trainings) if comp_trainings else None
    education_raw  = max((score_education(e) for e in comp_education), default=None)
    self_report_raw = max((score_self_report(e) for e in comp_selfreport), default=None)

    # Weighted contributions (only where evidence exists)
    assessment_contrib  = (assessment_raw  or 0.0) * WEIGHT_ASSESSMENT
    experience_contrib  = (experience_raw  or 0.0) * WEIGHT_EXPERIENCE
    training_contrib    = (training_raw    or 0.0) * WEIGHT_TRAINING
    education_contrib   = (education_raw   or 0.0) * WEIGHT_EDUCATION
    self_report_contrib = (self_report_raw or 0.0) * WEIGHT_SELF_REPORT

    final_score = round(
        assessment_contrib + experience_contrib + training_contrib +
        education_contrib + self_report_contrib,
        2
    )

    return CompetencyScoreBreakdown(
        competency_code=competency_code,
        final_score=final_score,
        assessment_raw=assessment_raw,
        experience_raw=experience_raw,
        training_raw=training_raw,
        education_raw=education_raw,
        self_report_raw=self_report_raw,
        assessment_contribution=round(assessment_contrib, 4),
        experience_contribution=round(experience_contrib, 4),
        training_contribution=round(training_contrib, 4),
        education_contribution=round(education_contrib, 4),
        self_report_contribution=round(self_report_contrib, 4),
    )


def score_all_competencies(
    profile: OfficerProfile,
    competency_codes: list[str],
) -> dict[str, CompetencyScoreBreakdown]:
    """
    Score every competency in the list for a given officer profile.
    Returns {competency_code: CompetencyScoreBreakdown}
    """
    return {
        code: score_competency(
            competency_code=code,
            assessments=profile.assessments,
            experiences=profile.experiences,
            trainings=profile.trainings,
            education=profile.education,
            self_reports=profile.self_reports,
        )
        for code in competency_codes
    }
