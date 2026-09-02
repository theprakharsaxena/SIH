"""
Recommendation Engine — Explainable course ranking.

Scores each course against an officer's gap report using a weighted formula:
  35%  Role Match       — does the course cover a competency this role needs?
  25%  Skill Gap Size   — bigger gap → higher priority
  15%  Level Match      — is course level appropriate for current competency?
  15%  Priority         — critical competencies ranked higher
  10%  Learning History — haven't taken this before → higher score

Every recommendation includes a human-readable reason_text explaining the score.

No LLM in the ranking logic — it's a deterministic formula.
pgvector semantic search is used only for the semantic similarity component.
"""
from sqlalchemy.orm import Session

from app.db.models import Course, CourseCompetency, Competency, Enrollment
from app.domain.models import (
    CompetencyGap, GapReport, CourseRecommendation,
    GAP_CATEGORY_A, GAP_CATEGORY_B, GAP_CATEGORY_C,
)

# ─── Scoring weights ──────────────────────────────────────────────────────────
W_ROLE_MATCH     = 0.35
W_GAP_SIZE       = 0.25
W_LEVEL_MATCH    = 0.15
W_PRIORITY       = 0.15
W_HISTORY        = 0.10

# ─── Helpers ──────────────────────────────────────────────────────────────────

LEVEL_ORDER = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}

PRIORITY_SCORE = {"critical": 1.0, "standard": 0.6, "nice_to_have": 0.3}


def _role_match_score(course_comp_codes: set[str], gap: CompetencyGap) -> float:
    """1.0 if course directly targets this competency, else 0."""
    return 1.0 if gap.competency_code in course_comp_codes else 0.0


def _gap_size_score(gap: CompetencyGap) -> float:
    """Normalise gap (0–5 max) to 0–1. Category C gaps score highest."""
    if gap.category == GAP_CATEGORY_A:
        return 0.0
    return min(max(gap.gap / 5.0, 0.0), 1.0)


def _level_match_score(course_level: str | None, current_score: float) -> float:
    """
    Ideal: course level matches current competency score.
    current 0-1 → Beginner, 1-2 → Beginner, 2-3 → Intermediate, 3+ → Advanced
    """
    if not course_level:
        return 0.5
    ideal_level = (
        "Beginner" if current_score < 2.5 else
        "Intermediate" if current_score < 3.5 else
        "Advanced"
    )
    if course_level == ideal_level:
        return 1.0
    level_diff = abs(LEVEL_ORDER.get(course_level, 2) - LEVEL_ORDER.get(ideal_level, 2))
    return max(1.0 - (level_diff * 0.4), 0.0)


def _history_score(
    course_id: str, officer_id: str, enrollments: set[str]
) -> float:
    """1.0 if not enrolled before, 0.3 if completed, 0.5 if dropped/in-progress."""
    return 0.0 if course_id in enrollments else 1.0


def _build_reason_text(
    course_title: str,
    competency_name: str,
    current_score: float,
    required_score: float,
    gap: float,
    category: str,
    course_level: str,
    priority: str,
    already_enrolled: bool,
) -> str:
    category_label = {"A": "no gap", "B": "slight gap", "C": "considerable gap"}.get(category, "gap")
    parts = [
        f"Recommended because: Your role requires {competency_name} at level {required_score:.1f}.",
        f"Current level: {current_score:.1f} ({category_label}, gap = {gap:.1f}).",
    ]
    if course_level:
        parts.append(f"This {course_level.lower()}-level course matches your current proficiency.")
    if priority == "critical":
        parts.append("⚠ This is a critical competency for your role.")
    if already_enrolled:
        parts.append("Note: You have previously enrolled in this course.")
    return " ".join(parts)


# ─── Main recommendation function ─────────────────────────────────────────────

def recommend_courses(
    db: Session,
    officer_id: str,
    gap_report: GapReport,
    top_n: int = 10,
) -> list[CourseRecommendation]:
    """
    Generate ranked course recommendations for an officer based on their gap report.

    Args:
        db: DB session (read-only queries)
        officer_id: officer's ID (to check enrollment history)
        gap_report: output of gap_engine.calculate_gap_report()
        top_n: number of recommendations to return

    Returns:
        List of CourseRecommendation, sorted by relevance_score desc.
    """
    # Build gap lookup: {competency_code: CompetencyGap}
    gap_by_code: dict[str, CompetencyGap] = {g.competency_code: g for g in gap_report.gaps}

    # Only recommend for actual gaps (Category B or C)
    actionable_gaps = [g for g in gap_report.gaps if g.category != GAP_CATEGORY_A]
    if not actionable_gaps:
        return []

    # Build set of competency codes with gaps
    gap_codes = {g.competency_code for g in actionable_gaps}

    # Load officer's enrollment history (to deprioritize already-taken courses)
    enrolled_course_ids = {
        e.course_id for e in db.query(Enrollment).filter_by(official_id=officer_id).all()
    }

    # Load all courses that cover at least one gap competency
    relevant_courses = (
        db.query(Course, CourseCompetency, Competency)
        .join(CourseCompetency, Course.id == CourseCompetency.course_id)
        .join(Competency, CourseCompetency.competency_id == Competency.id)
        .filter(Competency.code.in_(gap_codes))
        .all()
    )

    # Group by course_id → {course: set of covered competency codes}
    course_map: dict[str, tuple[Course, set[str]]] = {}
    for course, cc, comp in relevant_courses:
        if course.id not in course_map:
            course_map[course.id] = (course, set())
        course_map[course.id][1].add(comp.code)

    recommendations: list[CourseRecommendation] = []

    for course_id, (course, comp_codes) in course_map.items():
        # Find the LARGEST gap this course addresses (primary gap)
        addressed_gaps = [gap_by_code[c] for c in comp_codes if c in gap_by_code and gap_by_code[c].category != GAP_CATEGORY_A]
        if not addressed_gaps:
            continue

        # Pick the most critical gap this course addresses for scoring
        primary_gap = max(addressed_gaps, key=lambda g: (
            0 if g.category == GAP_CATEGORY_A else 1 if g.category == GAP_CATEGORY_B else 2,
            g.gap,
        ))

        already_enrolled = course_id in enrolled_course_ids

        # ── Score components ──
        role_match   = _role_match_score(comp_codes, primary_gap)
        gap_size     = _gap_size_score(primary_gap)
        level_match  = _level_match_score(course.level, primary_gap.current_score)
        priority_s   = PRIORITY_SCORE.get(primary_gap.priority, 0.5)
        history      = 0.3 if already_enrolled else 1.0

        final_score = round(
            W_ROLE_MATCH   * role_match   +
            W_GAP_SIZE     * gap_size     +
            W_LEVEL_MATCH  * level_match  +
            W_PRIORITY     * priority_s   +
            W_HISTORY      * history,
            4
        )

        reason = _build_reason_text(
            course_title=course.title,
            competency_name=primary_gap.competency_name,
            current_score=primary_gap.current_score,
            required_score=primary_gap.required_score,
            gap=primary_gap.gap,
            category=primary_gap.category,
            course_level=course.level or "",
            priority=primary_gap.priority,
            already_enrolled=already_enrolled,
        )

        recommendations.append(CourseRecommendation(
            course_id=course_id,
            course_title=course.title,
            provider_type=course.provider_type,
            delivery_mode=course.delivery_mode or "Unknown",
            level=course.level or "Unknown",
            duration_hours=float(course.duration_hours or 0),
            competency_code=primary_gap.competency_code,
            competency_name=primary_gap.competency_name,
            gap_addressed=primary_gap.gap,
            relevance_score=final_score,
            score_breakdown={
                "role_match":   round(role_match, 3),
                "gap_size":     round(gap_size, 3),
                "level_match":  round(level_match, 3),
                "priority":     round(priority_s, 3),
                "history":      round(history, 3),
            },
            reason_text=reason,
        ))

    # Sort by score descending, then by gap size as tiebreaker
    recommendations.sort(key=lambda r: (-r.relevance_score, -r.gap_addressed))

    return recommendations[:top_n]


def recommendations_to_dict(recs: list[CourseRecommendation]) -> list[dict]:
    """Serialize list of CourseRecommendation to API-ready dicts."""
    return [
        {
            "rank": i + 1,
            "course_id": r.course_id,
            "course_title": r.course_title,
            "provider_type": r.provider_type,
            "delivery_mode": r.delivery_mode,
            "level": r.level,
            "duration_hours": r.duration_hours,
            "competency_code": r.competency_code,
            "competency_name": r.competency_name,
            "gap_addressed": r.gap_addressed,
            "relevance_score": r.relevance_score,
            "score_breakdown": r.score_breakdown,
            "reason_text": r.reason_text,
        }
        for i, r in enumerate(recs)
    ]
