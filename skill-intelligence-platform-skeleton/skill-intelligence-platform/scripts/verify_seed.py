"""
Verify seed data — run after seed_from_mock.py to confirm everything loaded correctly.
    python scripts/verify_seed.py
"""
import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from app.db.session import SessionLocal
from app.db.models import (
    Competency, Role, RoleCompetencyRequirement,
    Course, CourseCompetency,
)

PASS = "✅"
FAIL = "❌"
WARN = "⚠️ "


def check(label: str, actual: int, expected: int):
    icon = PASS if actual == expected else FAIL
    print(f"  {icon} {label}: {actual} (expected {expected})")
    return actual == expected


def main():
    db = SessionLocal()
    try:
        print("\n" + "=" * 50)
        print("Seed Verification")
        print("=" * 50)

        results = []

        # Competencies
        total_comps = db.query(Competency).count()
        statistical = db.query(Competency).filter_by(domain_category="Statistical").count()
        technical = db.query(Competency).filter_by(domain_category="Technical").count()
        dg = db.query(Competency).filter_by(domain_category="Digital Governance").count()
        bm = db.query(Competency).filter_by(domain_category="Behavioural & Managerial").count()
        ps_mandated = db.query(Competency).filter_by(ps_mandated=True).count()

        print("\n[Competencies]")
        results.append(check("Total competencies", total_comps, 35))
        results.append(check("Statistical (OS-01 to OS-12)", statistical, 12))
        results.append(check("Technical (TC-01 to TC-12)", technical, 12))
        results.append(check("Digital Governance (DG-01 to DG-05)", dg, 5))
        results.append(check("Behavioural & Managerial (BM-01 to BM-06)", bm, 6))
        results.append(check("PS-mandated competencies", ps_mandated, 33))  # OS-11 and OS-12 are not PS-mandated

        # Roles
        total_roles = db.query(Role).count()
        print("\n[Roles]")
        results.append(check("Total roles", total_roles, 4))
        for code in ["JSO", "SSO", "MCTP-II", "MCTP-III"]:
            role = db.query(Role).filter_by(code=code).one_or_none()
            icon = PASS if role else FAIL
            print(f"  {icon} Role '{code}' exists")
            results.append(role is not None)

        # Role-competency requirements
        total_reqs = db.query(RoleCompetencyRequirement).count()
        print("\n[Role-Competency Requirements]")
        results.append(check("Total requirements", total_reqs, 140))  # 35 competencies × 4 roles

        # Courses
        total_courses = db.query(Course).count()
        igot_courses = db.query(Course).filter_by(provider_type="iGOT").count()
        nssta_courses = db.query(Course).filter_by(provider_type="NSSTA").count()
        course_comp_links = db.query(CourseCompetency).count()

        print("\n[Courses]")
        results.append(check("Total courses", total_courses, 50))
        print(f"  {PASS} iGOT courses: {igot_courses}")
        print(f"  {PASS} NSSTA courses: {nssta_courses}")
        print(f"  {PASS} Course-competency links: {course_comp_links}")

        # Sample spot checks
        print("\n[Spot Checks]")
        sampling = db.query(Competency).filter_by(code="OS-02").one_or_none()
        print(f"  {PASS if sampling else FAIL} OS-02 (Sampling Methodology) exists: {sampling.name if sampling else 'MISSING'}")
        python_comp = db.query(Competency).filter_by(code="TC-01").one_or_none()
        print(f"  {PASS if python_comp else FAIL} TC-01 (Python) exists: {python_comp.name if python_comp else 'MISSING'}")

        # Summary
        passed = sum(1 for r in results if r)
        print(f"\n{'='*50}")
        print(f"Result: {passed}/{len(results)} checks passed")
        if passed == len(results):
            print("✅ All checks passed — DB is ready.")
        else:
            print("❌ Some checks failed — re-run seed_from_mock.py and check errors.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
