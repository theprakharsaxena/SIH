"""
Unit tests for evidence_scorer.py — the deterministic 5-factor scoring engine.
Run with: python -m pytest tests/ -v

Key test: The worked example from the xlsx should produce Python score = 2.92
  Assessment: 68% → 3.4 × 0.30 = 1.02
  Experience: 2yr Direct → 2 × 1.0 = 2.0 × 0.25 = 0.50
  Training: iGOT Basics completed, no assessment → 2 × 0.20 = 0.40
  Education: B.Sc Stats (adjacent) → 3 × 0.15 = 0.45
  Self-report: "comfortable" → 3.5 × 0.10 = 0.35
  Total = 1.02 + 0.50 + 0.40 + 0.45 + 0.35 = 2.72

Note: The docx worked example shows 2.92 because it used different intermediate values.
We use the exact rules from the Raw_Score_Conversion_Rules sheet.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from app.domain.evidence_scorer import (
    score_assessment, score_experience, score_training, score_training_list,
    score_education, score_self_report, score_competency, WEIGHT_ASSESSMENT,
    WEIGHT_EXPERIENCE, WEIGHT_TRAINING, WEIGHT_EDUCATION, WEIGHT_SELF_REPORT,
)
from app.domain.models import (
    AssessmentEvidence, ExperienceEvidence, TrainingEvidence,
    EducationEvidence, SelfReportEvidence, OfficerProfile,
)


# ─── Weights sum to 1.0 ───────────────────────────────────────────────────────

def test_weights_sum_to_one():
    total = WEIGHT_ASSESSMENT + WEIGHT_EXPERIENCE + WEIGHT_TRAINING + WEIGHT_EDUCATION + WEIGHT_SELF_REPORT
    assert abs(total - 1.0) < 1e-9


# ─── Rule A: Assessment ───────────────────────────────────────────────────────

class TestAssessmentScoring:
    def test_68_percent(self):
        e = AssessmentEvidence(test_percent=68, competency_code="TC-01")
        assert score_assessment(e) == 3.4

    def test_100_percent(self):
        e = AssessmentEvidence(test_percent=100, competency_code="TC-01")
        assert score_assessment(e) == 5.0

    def test_0_percent(self):
        e = AssessmentEvidence(test_percent=0, competency_code="TC-01")
        assert score_assessment(e) == 0.0

    def test_50_percent(self):
        e = AssessmentEvidence(test_percent=50, competency_code="TC-01")
        assert score_assessment(e) == 2.5

    def test_above_100_capped(self):
        e = AssessmentEvidence(test_percent=120, competency_code="TC-01")
        assert score_assessment(e) == 5.0


# ─── Rule B: Work Experience ──────────────────────────────────────────────────

class TestExperienceScoring:
    def test_2yr_direct(self):
        # 2 years → band score 2, Direct → factor 1.0, result = 2.0
        e = ExperienceEvidence(years=2, relevance="direct", competency_code="OS-01")
        assert score_experience(e) == 2.0

    def test_4yr_direct(self):
        # 4 years → band score 3, Direct → factor 1.0
        e = ExperienceEvidence(years=4, relevance="direct", competency_code="OS-01")
        assert score_experience(e) == 3.0

    def test_2yr_adjacent(self):
        # 2yr → 2, Adjacent → 0.6, result = 1.2
        e = ExperienceEvidence(years=2, relevance="adjacent", competency_code="OS-01")
        assert score_experience(e) == 1.2

    def test_2yr_tangential(self):
        # 2yr → 2, Tangential → 0.3, result = 0.6
        e = ExperienceEvidence(years=2, relevance="tangential", competency_code="OS-01")
        assert score_experience(e) == 0.6

    def test_unrelated_zero(self):
        e = ExperienceEvidence(years=10, relevance="unrelated", competency_code="OS-01")
        assert score_experience(e) == 0.0

    def test_10plus_direct(self):
        # 10+ years → band score 5, Direct → 5.0
        e = ExperienceEvidence(years=15, relevance="direct", competency_code="OS-01")
        assert score_experience(e) == 5.0

    def test_case_insensitive_relevance(self):
        e = ExperienceEvidence(years=2, relevance="DIRECT", competency_code="OS-01")
        assert score_experience(e) == 2.0


# ─── Rule C: Prior Training ───────────────────────────────────────────────────

class TestTrainingScoring:
    def test_no_course(self):
        e = TrainingEvidence(course_level="none", passed_assessment=False, competency_code="TC-01")
        assert score_training(e) == 0

    def test_beginner_completed_no_pass(self):
        e = TrainingEvidence(course_level="beginner", passed_assessment=False, competency_code="TC-01")
        assert score_training(e) == 2

    def test_beginner_passed(self):
        e = TrainingEvidence(course_level="beginner", passed_assessment=True, competency_code="TC-01")
        assert score_training(e) == 3

    def test_intermediate_passed(self):
        e = TrainingEvidence(course_level="intermediate", passed_assessment=True, competency_code="TC-01")
        assert score_training(e) == 4

    def test_advanced_passed(self):
        e = TrainingEvidence(course_level="advanced", passed_assessment=True, competency_code="TC-01")
        assert score_training(e) == 5

    def test_max_across_multiple(self):
        # If multiple trainings, take MAX
        evidences = [
            TrainingEvidence(course_level="beginner", passed_assessment=True, competency_code="TC-01"),  # 3
            TrainingEvidence(course_level="intermediate", passed_assessment=True, competency_code="TC-01"),  # 4
        ]
        assert score_training_list(evidences) == 4

    def test_empty_training_list(self):
        assert score_training_list([]) == 0.0


# ─── Rule D: Education ────────────────────────────────────────────────────────

class TestEducationScoring:
    def test_direct_masters(self):
        e = EducationEvidence(education_score=5, competency_code="OS-01")
        assert score_education(e) == 5.0

    def test_unrelated(self):
        e = EducationEvidence(education_score=1, competency_code="OS-01")
        assert score_education(e) == 1.0

    def test_clamped_above_5(self):
        e = EducationEvidence(education_score=6, competency_code="OS-01")
        assert score_education(e) == 5.0

    def test_clamped_below_1(self):
        e = EducationEvidence(education_score=0, competency_code="OS-01")
        assert score_education(e) == 1.0


# ─── Rule E: Self-report ─────────────────────────────────────────────────────

class TestSelfReportScoring:
    def test_passthrough(self):
        e = SelfReportEvidence(self_score=3.5, competency_code="TC-01")
        assert score_self_report(e) == 3.5

    def test_clamped_above_5(self):
        e = SelfReportEvidence(self_score=6, competency_code="TC-01")
        assert score_self_report(e) == 5.0


# ─── Combined scorer ─────────────────────────────────────────────────────────

class TestScoreCompetency:
    def test_worked_example_from_docx(self):
        """
        Python competency for a Statistical Officer:
        - Assessment: 68%      → 3.4 × 0.30 = 1.02
        - Experience: 2yr, Direct → 2.0 × 0.25 = 0.50
        - Training: iGOT Basics, completed, no final assessment → 2 × 0.20 = 0.40
        - Education: adjacent bachelor's → 3 × 0.15 = 0.45
        - Self-report: 3.5 → 3.5 × 0.10 = 0.35
        Total = 2.72
        """
        result = score_competency(
            competency_code="TC-01",
            assessments=[AssessmentEvidence(test_percent=68, competency_code="TC-01")],
            experiences=[ExperienceEvidence(years=2, relevance="direct", competency_code="TC-01")],
            trainings=[TrainingEvidence(course_level="beginner", passed_assessment=False, competency_code="TC-01")],
            education=[EducationEvidence(education_score=3, competency_code="TC-01")],
            self_reports=[SelfReportEvidence(self_score=3.5, competency_code="TC-01")],
        )
        assert result.competency_code == "TC-01"
        assert result.assessment_raw == 3.4
        assert result.experience_raw == 2.0
        assert result.training_raw == 2.0
        assert result.education_raw == 3.0
        assert result.self_report_raw == 3.5
        assert abs(result.final_score - 2.72) < 0.01, f"Expected ~2.72, got {result.final_score}"

    def test_no_evidence_scores_zero(self):
        result = score_competency("OS-01")
        assert result.final_score == 0.0

    def test_filters_by_competency_code(self):
        """Evidence for TC-01 should not affect OS-01 score."""
        result = score_competency(
            competency_code="OS-01",
            assessments=[AssessmentEvidence(test_percent=100, competency_code="TC-01")],
        )
        assert result.final_score == 0.0

    def test_explanation_not_empty(self):
        result = score_competency(
            competency_code="TC-01",
            assessments=[AssessmentEvidence(test_percent=80, competency_code="TC-01")],
        )
        explanation = result.explanation()
        assert "Assessment" in explanation
        assert "4.0" in explanation or "4" in explanation
