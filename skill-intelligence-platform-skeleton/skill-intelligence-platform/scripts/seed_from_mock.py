"""
Seed script — loads all competencies, roles, role_competency_requirements,
and courses into the DB using the adapter pattern.

Run once after `docker-compose up`:
    python scripts/seed_from_mock.py

Safe to re-run: uses upsert logic (insert-or-update).
"""
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

import pandas as pd
from sqlalchemy.orm import Session

from app.db.session import SessionLocal, engine
from app.db.models import (
    Base, Competency, Role, RoleCompetencyRequirement,
    Course, CourseCompetency, Official,
)
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
from app.adapters.course_catalog.mock_adapter import MockCourseCatalogAdapter
from app.config import MOCK_CATALOG_PATH

# ─── paths ────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
XLSX_ROLE_MATRIX = os.path.join(DATA_DIR, "Role_Competency_Matrix_and_Scoring_Model_v2.xlsx")

# ─── helpers ──────────────────────────────────────────────────────────────────

def upsert_competency(db: Session, code: str, name: str, category: str,
                      ps_mandated: bool, kcm_mapping: str | None = None,
                      source_note: str | None = None) -> Competency:
    obj = db.query(Competency).filter_by(code=code).one_or_none()
    if obj is None:
        obj = Competency(code=code)
        db.add(obj)
    obj.name = name
    obj.competency_type = "domain"
    obj.domain_category = category
    obj.ps_mandated = ps_mandated
    obj.kcm_mapping_code = kcm_mapping
    obj.source_note = source_note
    db.flush()
    return obj


def upsert_role(db: Session, code: str, name: str,
                service_stage: str, description: str) -> Role:
    obj = db.query(Role).filter_by(code=code).one_or_none()
    if obj is None:
        obj = Role(code=code)
        db.add(obj)
    obj.name = name
    obj.service_stage = service_stage
    obj.description = description
    obj.source_note = "Prototype. JSO/SSO=SSS cadre; MCTP-II/III=ISS cadre — two real service hierarchies simplified for MVP."
    db.flush()
    return obj


def seed_officials(db: Session, code_to_role: dict):
    print("Seeding demo officials / admin accounts...")
    demo_users = [
        {
            "email": "admin@mospi.gov.in",
            "full_name": "MoSPI Admin",
            "password": "admin123",
            "is_admin": True,
            "role_code": "MCTP-III",
            "department": "Directorate General",
            "designation": "System Administrator",
        },
        {
            "email": "anika.sharma@mospi.gov.in",
            "full_name": "Anika Sharma",
            "password": "password123",
            "is_admin": False,
            "role_code": "JSO",
            "department": "National Sample Survey Office (NSSO)",
            "designation": "Junior Statistical Officer",
            "years_experience": 3,
            "highest_qualification": "Master's Degree",
            "field_of_study": "Statistics",
            "university": "Delhi University",
            "graduation_year": 2021,
        },
        {
            "email": "jso@mospi.gov.in",
            "full_name": "JSO Officer",
            "password": "jso123",
            "is_admin": False,
            "role_code": "JSO",
            "department": "Field Operations Division",
            "designation": "Junior Statistical Officer",
        },
        {
            "email": "sso@mospi.gov.in",
            "full_name": "SSO Officer",
            "password": "sso123",
            "is_admin": False,
            "role_code": "SSO",
            "department": "National Accounts Division",
            "designation": "Senior Statistical Officer",
        },
    ]

    count = 0
    for u in demo_users:
        official = db.query(Official).filter_by(email=u["email"]).one_or_none()
        if official is None:
            official = Official(email=u["email"])
            db.add(official)
        
        role_id = code_to_role.get(u["role_code"])
        official.full_name = u["full_name"]
        official.hashed_password = pwd_context.hash(u["password"][:72])
        official.is_admin = u["is_admin"]
        official.role_id = role_id
        official.department = u.get("department")
        official.designation = u.get("designation")
        official.years_experience = u.get("years_experience")
        official.highest_qualification = u.get("highest_qualification")
        official.field_of_study = u.get("field_of_study")
        official.university = u.get("university")
        official.graduation_year = u.get("graduation_year")
        official.auth_source_system = "local"
        official.onboarding_complete = True
        count += 1

    db.commit()
    print(f"  ✓ {count} demo officials seeded")



# ─── 1. Seed competencies ─────────────────────────────────────────────────────

DOMAIN_COMPETENCIES = [
    # (code, name, category, ps_mandated, kcm_mapping, source_note)
    # Statistical
    ("OS-01", "Survey Design",                          "Statistical", True,  None, "PS-mandated"),
    ("OS-02", "Sampling Methodology",                   "Statistical", True,  None, "PS-mandated"),
    ("OS-03", "National Accounts (GDP)",                "Statistical", True,  None, "PS-mandated"),
    ("OS-04", "Price Statistics",                       "Statistical", True,  None, "PS-mandated"),
    ("OS-05", "Labour Statistics",                      "Statistical", True,  None, "PS-mandated"),
    ("OS-06", "Agricultural Statistics",                "Statistical", True,  None, "PS-mandated"),
    ("OS-07", "Industrial Statistics",                  "Statistical", True,  None, "PS-mandated"),
    ("OS-08", "SDG Indicators",                         "Statistical", True,  None, "PS-mandated"),
    ("OS-09", "Metadata Standards",                     "Statistical", True,  None, "PS-mandated; cross-check vs MoSPI NMDS/CMMI"),
    ("OS-10", "Data Quality Frameworks",                "Statistical", True,  None, "PS-mandated; cross-check vs MoSPI SQAF"),
    ("OS-11", "Time Series & Applied Econometrics",     "Statistical", False, None, "NEW — confirmed real training line, NSSTA FY26-27 (ISEC Bengaluru)"),
    ("OS-12", "Financial Statistics",                   "Statistical", False, None, "NEW — confirmed real training line, NSSTA FY26-27 (NIBM Pune)"),
    # Technical
    ("TC-01", "Python",               "Technical", True, None, "PS-mandated; ISI Delhi, MCTP-I"),
    ("TC-02", "R",                    "Technical", True, None, "PS-mandated; IASRI Delhi"),
    ("TC-03", "SQL",                  "Technical", True, None, "PS-mandated"),
    ("TC-04", "Stata",                "Technical", True, None, "PS-mandated"),
    ("TC-05", "SPSS",                 "Technical", True, None, "PS-mandated"),
    ("TC-06", "SAS",                  "Technical", True, None, "PS-mandated"),
    ("TC-07", "GIS",                  "Technical", True, None, "PS-mandated; IIRS Dehradun"),
    ("TC-08", "Data Visualization",   "Technical", True, None, "PS-mandated"),
    ("TC-09", "AI/ML",                "Technical", True, None, "PS-mandated; IIT, IIM Mumbai"),
    ("TC-10", "Cloud Computing",      "Technical", True, None, "PS-mandated"),
    ("TC-11", "APIs",                 "Technical", True, None, "PS-mandated"),
    ("TC-12", "Open Data",            "Technical", True, None, "PS-mandated"),
    # Digital Governance
    ("DG-01", "Cybersecurity",                   "Digital Governance", True, None, "PS-mandated"),
    ("DG-02", "Data Privacy",                    "Digital Governance", True, None, "PS-mandated; DPDP Act module in ISS curriculum"),
    ("DG-03", "Digital Signatures",              "Digital Governance", True, None, "PS-mandated"),
    ("DG-04", "Government Cloud",                "Digital Governance", True, None, "PS-mandated"),
    ("DG-05", "Digital Public Infrastructure",   "Digital Governance", True, None, "PS-mandated"),
    # Behavioural & Managerial (reference KCM — do not duplicate)
    ("BM-01", "Leadership",         "Behavioural & Managerial", True, "B10/B11/B12", "Reference KCM; do not duplicate"),
    ("BM-02", "Communication",      "Behavioural & Managerial", True, "B04",         "Reference KCM; do not duplicate"),
    ("BM-03", "Project Management", "Behavioural & Managerial", True, "F05",         "Reference KCM; do not duplicate"),
    ("BM-04", "Ethics",             "Behavioural & Managerial", True, None,           "Confirmed: ICCG Panchagani, ASCI — no direct KCM match"),
    ("BM-05", "Decision Making",    "Behavioural & Managerial", True, "B13",         "Reference KCM; do not duplicate"),
    ("BM-06", "Change Management",  "Behavioural & Managerial", True, "F20",         "Reference KCM; do not duplicate"),
]

ROLES = [
    # (code, name, service_stage, description)
    ("JSO",     "Junior Statistical Officer",             "SSS cadre, entry grade",  "Entry-level SSS cadre. Handles data collection, field survey operations."),
    ("SSO",     "Senior Statistical Officer",             "SSS cadre, senior grade", "Mid-level SSS cadre. Leads small teams, handles analysis and reporting."),
    ("MCTP-II", "Mid-Career Training Programme Level II", "ISS cadre, mid-career",   "ISS cadre mid-career milestone. Handles complex statistical operations."),
    ("MCTP-III","Mid-Career Training Programme Level III","ISS cadre, senior",       "Senior ISS cadre. Policy advisory, strategic planning, inter-ministerial coordination."),
]

# Required levels per competency code per role
# Source: Role_Competency_Matrix_and_Scoring_Model_v2.xlsx — Role_Competency_Matrix sheet
# WARNING: All values are prototype estimates. Domain expert verification needed.
ROLE_COMPETENCY_MATRIX = {
    # code       JSO   SSO  MCTP-II  MCTP-III   priority
    "OS-01": (   2,    3,     4,       5,       "critical"),
    "OS-02": (   2,    3,     4,       5,       "critical"),
    "OS-03": (   2,    3,     4,       5,       "critical"),
    "OS-04": (   1,    2,     3,       4,       "standard"),
    "OS-05": (   1,    2,     3,       4,       "standard"),
    "OS-06": (   1,    2,     3,       4,       "standard"),
    "OS-07": (   1,    2,     3,       4,       "standard"),
    "OS-08": (   2,    3,     4,       5,       "standard"),
    "OS-09": (   2,    3,     4,       5,       "standard"),
    "OS-10": (   2,    3,     4,       5,       "critical"),
    "OS-11": (   1,    2,     3,       4,       "standard"),
    "OS-12": (   1,    2,     3,       4,       "standard"),
    "TC-01": (   2,    3,     3,       4,       "critical"),
    "TC-02": (   2,    3,     3,       4,       "standard"),
    "TC-03": (   2,    3,     3,       4,       "critical"),
    "TC-04": (   1,    2,     2,       3,       "standard"),
    "TC-05": (   1,    2,     2,       3,       "standard"),
    "TC-06": (   1,    2,     2,       3,       "standard"),
    "TC-07": (   1,    2,     3,       3,       "standard"),
    "TC-08": (   2,    3,     4,       4,       "critical"),
    "TC-09": (   2,    3,     3,       4,       "critical"),
    "TC-10": (   1,    2,     3,       3,       "standard"),
    "TC-11": (   1,    2,     3,       3,       "standard"),
    "TC-12": (   2,    3,     3,       4,       "standard"),
    "DG-01": (   2,    3,     3,       4,       "critical"),
    "DG-02": (   3,    4,     4,       5,       "critical"),
    "DG-03": (   2,    2,     2,       3,       "standard"),
    "DG-04": (   2,    3,     3,       3,       "standard"),
    "DG-05": (   2,    3,     3,       3,       "standard"),
    "BM-01": (   2,    4,     5,       5,       "critical"),
    "BM-02": (   3,    4,     5,       5,       "critical"),
    "BM-03": (   2,    4,     4,       5,       "standard"),
    "BM-04": (   3,    4,     5,       5,       "critical"),
    "BM-05": (   3,    4,     5,       5,       "critical"),
    "BM-06": (   2,    3,     4,       4,       "standard"),
}

ROLE_CODES_ORDERED = ["JSO", "SSO", "MCTP-II", "MCTP-III"]


def seed_competencies(db: Session) -> dict[str, str]:
    """Returns {code: competency_id}"""
    print("Seeding competencies...")
    code_to_id = {}
    for code, name, category, ps_mandated, kcm_mapping, source_note in DOMAIN_COMPETENCIES:
        comp = upsert_competency(db, code, name, category, ps_mandated, kcm_mapping, source_note)
        code_to_id[code] = comp.id
    db.commit()
    print(f"  ✓ {len(DOMAIN_COMPETENCIES)} competencies seeded")
    return code_to_id


def seed_roles(db: Session) -> dict[str, str]:
    """Returns {code: role_id}"""
    print("Seeding roles...")
    code_to_id = {}
    for code, name, stage, desc in ROLES:
        role = upsert_role(db, code, name, stage, desc)
        code_to_id[code] = role.id
    db.commit()
    print(f"  ✓ {len(ROLES)} roles seeded")
    return code_to_id


def seed_role_competency_matrix(db: Session, code_to_comp: dict, code_to_role: dict):
    print("Seeding role-competency requirements...")
    count = 0
    for comp_code, (jso, sso, mctp2, mctp3, priority) in ROLE_COMPETENCY_MATRIX.items():
        comp_id = code_to_comp.get(comp_code)
        if not comp_id:
            print(f"  WARNING: competency {comp_code} not found, skipping")
            continue
        for role_code, req_level in zip(ROLE_CODES_ORDERED, [jso, sso, mctp2, mctp3]):
            role_id = code_to_role.get(role_code)
            obj = db.query(RoleCompetencyRequirement).filter_by(
                role_id=role_id, competency_id=comp_id
            ).one_or_none()
            if obj is None:
                obj = RoleCompetencyRequirement(role_id=role_id, competency_id=comp_id)
                db.add(obj)
            obj.required_level = req_level
            obj.priority = priority
            obj.source_status = "prototype"
            count += 1
    db.commit()
    print(f"  ✓ {count} role-competency requirements seeded")


def seed_courses(db: Session, code_to_comp: dict):
    print("Seeding courses from mock catalog...")
    adapter = MockCourseCatalogAdapter(MOCK_CATALOG_PATH)
    records = adapter.fetch_all_courses()
    count = 0
    skipped = 0
    for rec in records:
        # Upsert course
        course = db.query(Course).filter_by(
            source_system=adapter.source_system(), external_id=rec.external_id
        ).one_or_none()
        if course is None:
            course = Course(source_system=adapter.source_system(), external_id=rec.external_id)
            db.add(course)

        course.title = rec.title
        course.provider_type = rec.provider_type
        course.provider_name = rec.provider_name
        course.delivery_mode = rec.delivery_mode
        course.level = rec.level
        course.duration_hours = rec.duration_hours
        course.modules_count = rec.modules_count
        course.has_final_assessment = rec.has_final_assessment
        course.practice_tests_count = rec.practice_tests_count
        course.price = rec.price
        course.license = rec.license
        db.flush()

        # Re-link competencies (delete-then-insert for idempotency)
        db.query(CourseCompetency).filter_by(course_id=course.id).delete()
        for comp_code in rec.competency_codes:
            comp_id = code_to_comp.get(comp_code)
            if comp_id is None:
                print(f"  WARNING: competency {comp_code} not found for course '{rec.title}'")
                skipped += 1
                continue
            db.add(CourseCompetency(course_id=course.id, competency_id=comp_id))
        count += 1

    db.commit()
    print(f"  ✓ {count} courses seeded ({skipped} competency links skipped — check crosswalk)")


# ─── main ─────────────────────────────────────────────────────────────────────

def main():
    print("=" * 55)
    print("SIH Skill Intelligence Platform — DB Seed")
    print("=" * 55)

    # Create tables if they don't exist (for local dev without docker initdb)
    Base.metadata.create_all(bind=engine)

    db: Session = SessionLocal()
    try:
        code_to_comp = seed_competencies(db)
        code_to_role = seed_roles(db)
        seed_role_competency_matrix(db, code_to_comp, code_to_role)
        seed_courses(db, code_to_comp)
        seed_officials(db, code_to_role)
        print("\n✅ Seed complete. Run scripts/verify_seed.py to confirm.")
    except Exception as e:
        db.rollback()
        print(f"\n❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
