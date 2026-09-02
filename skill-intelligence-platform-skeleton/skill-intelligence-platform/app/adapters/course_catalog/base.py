"""
Port (abstract interface) for course catalog data sources.

Business logic (recommendation engine, dashboards) never imports a concrete
adapter directly. It depends only on this interface. Whichever adapter is
wired up in config.py at startup is the one that runs — swapping mock for
real iGOT/NSSTA later means writing one new class that implements this same
interface, then flipping COURSE_CATALOG_PROVIDER in the environment.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import Literal


@dataclass
class CourseRecord:
    """Normalized shape every adapter must produce, regardless of source."""
    external_id: str | None          # None for mock/native records
    title: str
    provider_type: Literal["iGOT", "NSSTA"]
    provider_name: str
    delivery_mode: Literal["Self-paced", "Instructor-led"]
    level: Literal["Beginner", "Intermediate", "Advanced"]
    duration_hours: float
    modules_count: int
    has_final_assessment: bool
    practice_tests_count: int
    price: str
    license: str
    competency_codes: list[str]      # e.g. ["OS-02", "TC-01"] — internal codes,
                                       # already resolved via the crosswalk table
                                       # if this adapter is a real external one


class CourseCatalogProvider(ABC):
    """Port: anything that can supply a list of courses implements this."""

    @abstractmethod
    def fetch_all_courses(self) -> list[CourseRecord]:
        """Return every course this provider currently knows about."""
        raise NotImplementedError

    @abstractmethod
    def source_system(self) -> str:
        """Identifier written into courses.source_system on ingest."""
        raise NotImplementedError
