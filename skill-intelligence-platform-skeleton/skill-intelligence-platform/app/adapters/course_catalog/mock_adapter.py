"""
Mock implementation of CourseCatalogProvider. Reads mock_course_catalog.json.
This is what runs today. When real access exists, IGOTCourseCatalogAdapter
(see igot_adapter.py.future) implements the exact same interface and gets
swapped in via config — no other file in the codebase changes.
"""
import json
from pathlib import Path

from .base import CourseCatalogProvider, CourseRecord


class MockCourseCatalogAdapter(CourseCatalogProvider):
    def __init__(self, json_path: str | Path):
        self._json_path = Path(json_path)

    def source_system(self) -> str:
        return "mock"

    def fetch_all_courses(self) -> list[CourseRecord]:
        data = json.loads(self._json_path.read_text())
        records = []
        for c in data["courses"]:
            records.append(CourseRecord(
                external_id=c.get("course_id"),
                title=c["title"],
                provider_type=c["provider_type"],
                provider_name=c["provider_name"],
                delivery_mode=c["delivery_mode"],
                level=c["level"],
                duration_hours=c["duration_hours"],
                modules_count=c["modules_count"],
                has_final_assessment=c["has_final_assessment"],
                practice_tests_count=c["practice_tests_count"],
                price=c["price"],
                license=c["license"],
                competency_codes=[comp["competency_id"] for comp in c["competencies"]],
            ))
        return records


# ============================================================================
# WHAT THE FUTURE REAL ADAPTER WILL LOOK LIKE (sketch, not runnable):
#
# class IGOTCourseCatalogAdapter(CourseCatalogProvider):
#     def __init__(self, api_base_url: str, api_token: str):
#         self._client = httpx.Client(base_url=api_base_url,
#                                      headers={"Authorization": f"Bearer {api_token}"})
#
#     def source_system(self) -> str:
#         return "igot"
#
#     def fetch_all_courses(self) -> list[CourseRecord]:
#         raw = self._client.get("/api/v1/courses/catalog").json()
#         records = []
#         for c in raw["courses"]:
#             # real competency tags won't match our OS-*/TC-* codes directly —
#             # resolve through external_competency_crosswalk instead of
#             # assuming a 1:1 match. This lookup is the one piece of genuinely
#             # new work a real integration requires.
#             internal_codes = resolve_crosswalk("igot", c["competencyTags"])
#             records.append(CourseRecord(
#                 external_id=c["id"],
#                 title=c["name"],
#                 ...
#                 competency_codes=internal_codes,
#             ))
#         return records
#
# Same shape in, same shape out. The recommendation engine downstream never
# needs to know this class exists.
# ============================================================================
