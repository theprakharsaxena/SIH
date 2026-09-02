"""
SQLAlchemy session factory and engine setup.
All DB access goes through get_db() — a FastAPI dependency.
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://sih:sih_secret@localhost:5432/skill_intelligence"
)

engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,   # detects stale connections
    echo=False,           # set True during debug to log all SQL
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Shared declarative base — all ORM models inherit from this."""
    pass


def get_db():
    """FastAPI dependency: yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
