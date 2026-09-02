"""
Sync service: pulls course records from WHICHEVER CourseCatalogProvider is
configured, and upserts them into our own `courses` table.

This is the seam. Nothing downstream of this file (gap engine, recommendation
engine, dashboards) ever calls an adapter directly or knows a mock/real
distinction exists — they only ever query the `courses` table. Run this as
a one-off seed script today, and as a scheduled sync job once a real API
exists.
"""
from sqlalchemy.orm import Session

from app.adapters.course_catalog.base import CourseCatalogProvider
from app.db import models


def sync_courses(db: Session, provider: CourseCatalogProvider) -> int:
    source = provider.source_system()
    records = provider.fetch_all_courses()
    count = 0

    for rec in records:
        course = (
            db.query(models.Course)
            .filter_by(source_system=source, external_id=rec.external_id)
            .one_or_none()
        )
        if course is None:
            course = models.Course(source_system=source, external_id=rec.external_id)
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

        db.flush()  # get course.id before linking competencies

        db.query(models.CourseCompetency).filter_by(course_id=course.id).delete()
        for code in rec.competency_codes:
            competency = db.query(models.Competency).filter_by(code=code).one_or_none()
            if competency is None:
                # Real-API case: an external competency tag with no crosswalk
                # entry yet. Log it, don't crash the whole sync.
                print(f"[catalog_sync] WARNING: no competency found for code '{code}' "
                      f"on course '{rec.title}' — check external_competency_crosswalk")
                continue
            db.add(models.CourseCompetency(course_id=course.id, competency_id=competency.id))

        count += 1

    db.commit()
    return count
