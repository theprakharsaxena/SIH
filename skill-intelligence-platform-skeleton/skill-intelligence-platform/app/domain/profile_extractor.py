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
from app.config import get_llm_client, get_llm_model
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


# ─── Main extractor ───────────────────────────────────────────────────────────

def extract_profile(
    officer_id: str,
    role_code: str,
    profile_text: str,
) -> OfficerProfile:
    """
    Extract structured evidence from free-text officer profile.

    Args:
        officer_id: ID of the officer (for the returned OfficerProfile)
        role_code: 'JSO' | 'SSO' | 'MCTP-II' | 'MCTP-III'
        profile_text: Free-text description of the officer's background

    Returns:
        OfficerProfile with all evidence lists populated from the LLM extraction.
    """
    client = get_llm_client()
    model = get_llm_model()

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Extract evidence from this officer profile:\n\n{profile_text}"},
            ],
            temperature=0.0,    # deterministic output — we need consistent JSON
            max_tokens=2048,
            response_format={"type": "json_object"},  # force JSON mode
        )
    except Exception as e:
        raise RuntimeError(f"LLM call failed: {e}") from e

    raw_json = response.choices[0].message.content or "{}"

    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError as e:
        # Try to extract JSON from the response if the model added markdown
        match = re.search(r"\{.*\}", raw_json, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            raise ValueError(f"LLM returned invalid JSON: {e}\nRaw: {raw_json[:500]}")

    return _build_profile(officer_id, role_code, data)


def _build_profile(officer_id: str, role_code: str, data: dict) -> OfficerProfile:
    """Convert raw LLM JSON dict into a typed OfficerProfile."""

    assessments = [
        AssessmentEvidence(
            competency_code=item["competency_code"],
            test_percent=float(item.get("test_percent", 0)),
            source_reference=item.get("source_reference"),
        )
        for item in data.get("assessments", [])
        if item.get("competency_code") and item.get("test_percent") is not None
    ]

    experiences = [
        ExperienceEvidence(
            competency_code=item["competency_code"],
            years=float(item.get("years", 0)),
            relevance=str(item.get("relevance", "unrelated")).lower(),
            source_reference=item.get("source_reference"),
        )
        for item in data.get("experiences", [])
        if item.get("competency_code")
    ]

    trainings = [
        TrainingEvidence(
            competency_code=item["competency_code"],
            course_level=str(item.get("course_level", "none")).lower(),
            passed_assessment=bool(item.get("passed_assessment", False)),
            course_title=item.get("course_title"),
            source_reference=item.get("source_reference"),
        )
        for item in data.get("trainings", [])
        if item.get("competency_code")
    ]

    education = [
        EducationEvidence(
            competency_code=item["competency_code"],
            education_score=float(item.get("education_score", 1)),
            degree=item.get("degree"),
            field=item.get("field"),
        )
        for item in data.get("education", [])
        if item.get("competency_code")
    ]

    self_reports = [
        SelfReportEvidence(
            competency_code=item["competency_code"],
            self_score=float(item.get("self_score", 1)),
        )
        for item in data.get("self_reports", [])
        if item.get("competency_code")
    ]

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
