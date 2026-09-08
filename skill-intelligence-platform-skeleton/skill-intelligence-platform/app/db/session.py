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
    "sqlite:///./skill_intelligence.db"
)

# Fallback to SQLite if PostgreSQL is specified in env but connection is unavailable
if DATABASE_URL.startswith("postgresql"):
    try:
        test_engine = create_engine(DATABASE_URL, pool_pre_ping=True)
        conn = test_engine.connect()
        conn.close()
    except Exception:
        print("⚠️ PostgreSQL unavailable on localhost:5432. Falling back to local SQLite database.")
        DATABASE_URL = "sqlite:///./skill_intelligence.db"

is_sqlite = DATABASE_URL.startswith("sqlite")
connect_args = {"check_same_thread": False} if is_sqlite else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    echo=False,
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
