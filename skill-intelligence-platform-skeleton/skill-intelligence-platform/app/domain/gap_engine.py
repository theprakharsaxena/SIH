"""
Gap Engine — Pure deterministic function.
Computes the skill gap between an officer's current scores and their role's requirements.

No I/O, no DB, no HTTP. Takes scored data and returns a GapReport.
Test this standalone before wiring to any service or API.
"""
from sqlalchemy.orm import Session

from app.domain.models import (
    CompetencyGap, CompetencyScoreBreakdown, GapReport,
    GAP_CATEGORY_A, GAP_CATEGORY_B, GAP_CATEGORY_C,
)
from app.db.models import Competency, RoleCompetencyRequirement, Role


def categorize_gap(gap: float) -> str:
    """
    Category A: gap <= 0    (meets or exceeds requirement)
    Category B: 0 < gap <= 1.5   (slight gap)
    Category C: gap > 1.5        (considerable gap — prioritize)
    """
    if gap <= 0:
        return GAP_CATEGORY_A
    elif gap <= 1.5:
        return GAP_CATEGORY_B
    else:
        return GAP_CATEGORY_C


def load_role_requirements(db: Session, role_code: str) -> dict[str, tuple[float, str]]:
    """
    Load required competency levels for a role from DB.
    Returns {competency_code: (required_level, priority)}
    """
    role = db.query(Role).filter_by(code=role_code).one_or_none()
    if role is None:
        raise ValueError(f"Role '{role_code}' not found in DB")

    requirements = (
        db.query(RoleCompetencyRequirement, Competency)
        .join(Competency, RoleCompetencyRequirement.competency_id == Competency.id)
        .filter(RoleCompetencyRequirement.role_id == role.id)
        .all()
    )
    return {
        comp.code: (float(req.required_level), req.priority)
        for req, comp in requirements
    }


def load_competency_names(db: Session) -> dict[str, str]:
    """Returns {code: name} for all competencies."""
    comps = db.query(Competency).all()
    return {c.code: c.name for c in comps}


def calculate_gap_report(
    db: Session,
    officer_id: str,
    role_code: str,
    scores: dict[str, CompetencyScoreBreakdown],
) -> GapReport:
    """
    Main gap engine function.

    Args:
        db: DB session (used only to load role requirements — read-only here)
        officer_id: officer's ID (for the report)
        role_code: e.g. 'JSO', 'SSO', 'MCTP-II', 'MCTP-III'
        scores: output of evidence_scorer.score_all_competencies()
                {competency_code: CompetencyScoreBreakdown}

    Returns:
        GapReport with all CompetencyGap items, sorted by gap size desc.
    """
    requirements = load_role_requirements(db, role_code)
    comp_names = load_competency_names(db)

    gaps: list[CompetencyGap] = []

    for comp_code, (required_level, priority) in requirements.items():
        breakdown = scores.get(comp_code)
        current_score = breakdown.final_score if breakdown else 0.0
        gap_value = round(required_level - current_score, 2)
        category = categorize_gap(gap_value)

        gaps.append(CompetencyGap(
            competency_code=comp_code,
            competency_name=comp_names.get(comp_code, comp_code),
            current_score=current_score,
            required_score=required_level,
            gap=gap_value,
            category=category,
            priority=priority,
            score_breakdown=breakdown,
        ))

    # Sort: Category C first, then by gap size descending, then by priority
    priority_order = {"critical": 0, "standard": 1, "nice_to_have": 2}
    category_order = {GAP_CATEGORY_C: 0, GAP_CATEGORY_B: 1, GAP_CATEGORY_A: 2}

    gaps.sort(key=lambda g: (
        category_order.get(g.category, 99),
        priority_order.get(g.priority, 99),
        -g.gap,
    ))

    return GapReport(officer_id=officer_id, role_code=role_code, gaps=gaps)


def gap_report_to_dict(report: GapReport) -> dict:
    """Serialize GapReport to a dict for API responses."""
    return {
        "officer_id": report.officer_id,
        "role_code": report.role_code,
        "overall_readiness_pct": report.overall_readiness_pct,
        "total_competencies": len(report.gaps),
        "critical_gaps": len(report.critical_gaps),
        "slight_gaps": len(report.slight_gaps),
        "no_gaps": len([g for g in report.gaps if g.category == GAP_CATEGORY_A]),
        "gaps": [
            {
                "competency_code": g.competency_code,
                "competency_name": g.competency_name,
                "current_score": g.current_score,
                "required_score": g.required_score,
                "gap": g.gap,
                "category": g.category,
                "priority": g.priority,
                "score_breakdown": (
                    {
                        "assessment_raw": g.score_breakdown.assessment_raw,
                        "experience_raw": g.score_breakdown.experience_raw,
                        "training_raw":   g.score_breakdown.training_raw,
                        "education_raw":  g.score_breakdown.education_raw,
                        "self_report_raw": g.score_breakdown.self_report_raw,
                        "explanation":    g.score_breakdown.explanation(),
                    }
                    if g.score_breakdown else None
                ),
            }
            for g in report.gaps
        ],
    }
