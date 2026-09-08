"""
Profile Extractor — LLM component (the ONLY place LLM touches scoring inputs).

Takes an unstructured officer profile (free text, CV, form) and extracts
structured evidence facts. The output feeds directly into evidence_scorer.py.

RULE: This module extracts RAW FACTS only.
      It NEVER assigns a 0-5 competency score.
      Deterministic conversion rules in evidence_scorer.py do that.
"""
import json
import re
from app.config import get_llm_client, get_llm_model, get_fast_llm_model, execute_llm_with_fallback
from app.domain.models import (
    OfficerProfile,
    AssessmentEvidence,
    ExperienceEvidence,
    TrainingEvidence,
    EducationEvidence,
    SelfReportEvidence,
)

# ─── System prompt ────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are an evidence extraction assistant for India's Official Statistical System workforce platform.

Your job: Extract structured evidence from an officer's profile text and return ONLY valid JSON.

EXTRACTION RULES:
1. Extract only what is explicitly stated. Do NOT infer or guess.
2. For experience relevance: 'direct' = same competency area, 'adjacent' = related area, 'tangential' = loosely related, 'unrelated' = no connection.
3. For education: Only extract if the degree is mentioned. Assign education_score: 1=unrelated, 2=unrelated+relevant coursework, 3=adjacent field bachelor's, 4=direct field bachelor's, 5=direct field master's/PhD.
4. For training: Extract completed courses/trainings only. level must be 'none'|'beginner'|'intermediate'|'advanced'.
5. For self_report: Only extract if the officer explicitly states their skill level (e.g., "proficient in Python", "3/5 in sampling").
6. Competency codes: Use ONLY these codes — OS-01 through OS-12 (Statistical), TC-01 through TC-12 (Technical), DG-01 through DG-05 (Digital Governance), BM-01 through BM-06 (Behavioural).
7. If you are unsure about a competency code, use the closest match or skip it.

COMPETENCY CODE REFERENCE:
Statistical: OS-01=Survey Design, OS-02=Sampling Methodology, OS-03=National Accounts(GDP), OS-04=Price Statistics, OS-05=Labour Statistics, OS-06=Agricultural Statistics, OS-07=Industrial Statistics, OS-08=SDG Indicators, OS-09=Metadata Standards, OS-10=Data Quality Frameworks, OS-11=Time Series & Econometrics, OS-12=Financial Statistics
Technical: TC-01=Python, TC-02=R, TC-03=SQL, TC-04=Stata, TC-05=SPSS, TC-06=SAS, TC-07=GIS, TC-08=Data Visualization, TC-09=AI/ML, TC-10=Cloud Computing, TC-11=APIs, TC-12=Open Data
Digital Governance: DG-01=Cybersecurity, DG-02=Data Privacy, DG-03=Digital Signatures, DG-04=Government Cloud, DG-05=Digital Public Infrastructure
Behavioural: BM-01=Leadership, BM-02=Communication, BM-03=Project Management, BM-04=Ethics, BM-05=Decision Making, BM-06=Change Management

OUTPUT FORMAT (return ONLY this JSON, no explanation, no markdown):
{
  "assessments": [
    {"competency_code": "TC-01", "test_percent": 68.0, "source_reference": "Python test, 2023"}
  ],
  "experiences": [
    {"competency_code": "OS-02", "years": 4.0, "relevance": "direct", "source_reference": "Survey Data Analysis role, MoSPI"}
  ],
  "trainings": [
    {"competency_code": "TC-01", "course_level": "beginner", "passed_assessment": false, "course_title": "iGOT Python Basics", "source_reference": "iGOT certificate 2023"}
  ],
  "education": [
    {"competency_code": "OS-02", "education_score": 4.0, "degree": "M.Sc Statistics", "field": "Statistics"}
  ],
  "self_reports": [
    {"competency_code": "TC-01", "self_score": 3.5}
  ]
}"""


def safe_float(val, default: float = 0.0) -> float:
    """Safely convert strings like '2 Years', '50%', '3/5', None into float."""
    if val is None:
        return default
    if isinstance(val, (int, float)):
        return float(val)
    if isinstance(val, str):
        match = re.search(r"[-+]?\d*\.?\d+", val)
        if match:
            try:
                return float(match.group())
            except ValueError:
                return default
    return default


def parse_llm_json(raw_text: str) -> dict:
    """Robustly parse LLM JSON response even if markdown or minor syntax errors exist."""
    if not raw_text:
        return {}

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```[a-zA-Z]*\n?", "", cleaned)
        cleaned = re.sub(r"\n?```$", "", cleaned)
        cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Try matching first { to last }
    match = re.search(r"(\{.*\})", cleaned, re.DOTALL)
    if match:
        candidate = match.group(1)
        # Fix trailing commas before } or ]
        candidate_clean = re.sub(r",\s*([\}\]])", r"\1", candidate)
        try:
            return json.loads(candidate_clean)
        except json.JSONDecodeError:
            pass

    return {}


# ─── Main extractor ───────────────────────────────────────────────────────────

def extract_profile(
    officer_id: str,
    role_code: str,
    profile_text: str,
) -> OfficerProfile:
    """
    Extract structured evidence from free-text officer profile with automatic model fallback.

    Args:
        officer_id: ID of the officer (for the returned OfficerProfile)
        role_code: 'JSO' | 'SSO' | 'MCTP-II' | 'MCTP-III'
        profile_text: Free-text description of the officer's background

    Returns:
        OfficerProfile with all evidence lists populated from the LLM extraction.
    """
    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": f"Extract evidence from this officer profile:\n\n{profile_text}"},
    ]

    try:
        raw_json = execute_llm_with_fallback(
            messages=messages,
            primary_model=get_fast_llm_model(),
            fallback_model=get_llm_model(),
            temperature=0.0,
            max_tokens=1536,
        )
    except Exception as e:
        raise RuntimeError(f"LLM extraction failed on primary & fallback models: {e}") from e

    data = parse_llm_json(raw_json)

    return _build_profile(officer_id, role_code, data)


def _build_profile(officer_id: str, role_code: str, data: dict) -> OfficerProfile:
    """Convert raw LLM JSON dict into a typed OfficerProfile."""
    if not isinstance(data, dict):
        data = {}

    assessments = []
    for item in data.get("assessments", []):
        if isinstance(item, dict) and item.get("competency_code"):
            assessments.append(
                AssessmentEvidence(
                    competency_code=str(item["competency_code"]).strip().upper(),
                    test_percent=safe_float(item.get("test_percent"), 0.0),
                    source_reference=str(item.get("source_reference", "")) if item.get("source_reference") else None,
                )
            )

    experiences = []
    for item in data.get("experiences", []):
        if isinstance(item, dict) and item.get("competency_code"):
            experiences.append(
                ExperienceEvidence(
                    competency_code=str(item["competency_code"]).strip().upper(),
                    years=safe_float(item.get("years"), 1.0),
                    relevance=str(item.get("relevance", "direct")).lower().strip(),
                    source_reference=str(item.get("source_reference", "")) if item.get("source_reference") else None,
                )
            )

    trainings = []
    for item in data.get("trainings", []):
        if isinstance(item, dict) and item.get("competency_code"):
            trainings.append(
                TrainingEvidence(
                    competency_code=str(item["competency_code"]).strip().upper(),
                    course_level=str(item.get("course_level", "beginner")).lower().strip(),
                    passed_assessment=bool(item.get("passed_assessment", False)),
                    course_title=str(item.get("course_title", "")) if item.get("course_title") else None,
                    source_reference=str(item.get("source_reference", "")) if item.get("source_reference") else None,
                )
            )

    education = []
    for item in data.get("education", []):
        if isinstance(item, dict) and item.get("competency_code"):
            education.append(
                EducationEvidence(
                    competency_code=str(item["competency_code"]).strip().upper(),
                    education_score=safe_float(item.get("education_score"), 4.0),
                    degree=str(item.get("degree", "")) if item.get("degree") else None,
                    field=str(item.get("field", "")) if item.get("field") else None,
                )
            )

    self_reports = []
    for item in data.get("self_reports", []):
        if isinstance(item, dict) and item.get("competency_code"):
            self_reports.append(
                SelfReportEvidence(
                    competency_code=str(item["competency_code"]).strip().upper(),
                    self_score=safe_float(item.get("self_score"), 3.0),
                )
            )

    return OfficerProfile(
        officer_id=officer_id,
        role_code=role_code,
        assessments=assessments,
        experiences=experiences,
        trainings=trainings,
        education=education,
        self_reports=self_reports,
    )


# ─── Demo officer profile ─────────────────────────────────────────────────────
# Matches the demo scenario in MASTER_CONTEXT.md Section 13

DEMO_PROFILE_TEXT = """
Name: Anika Sharma
Designation: Statistical Officer
Department: MoSPI, Data Informatics & Innovation Division
Role: SSO (Senior Statistical Officer)

Work Experience:
- 4 years as Statistical Officer at MoSPI
- Current assignment: Survey Data Analysis — involves sampling frame design, questionnaire review, and tabulation
- 2 years previous: Field enumerator coordination for NSS round

Education:
- M.Sc Statistics from Delhi University (2020) — direct field

Training Completed:
- iGOT Karmayogi: "Sampling Methodology Basics" — Beginner level, completed, no final assessment
- iGOT Karmayogi: "Python for Data Analysis" — Beginner level, completed, no final assessment
- NSSTA: "Survey Design Fundamentals" — Beginner level, completed, passed assessment

Self-assessed Skills:
- Survey Design: 3.5/5 (comfortable designing questionnaires)
- Sampling: 4/5 (strong theoretical background)
- Python: 2/5 (basic scripts only)
- GIS: 1/5 (no experience)

Assessment Scores on Record:
- Python proficiency test (2024): 52%
"""
