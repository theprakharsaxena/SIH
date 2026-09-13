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


def ensure_schema_migrations():
    """Ensure newly added columns exist on DB startup."""
    from sqlalchemy import text
    with engine.connect() as conn:
        for sql in [
            "ALTER TABLE competencies ADD COLUMN future_readiness_tag VARCHAR DEFAULT 'Stable';",
            "ALTER TABLE competencies ADD COLUMN future_readiness_note TEXT;",
            "ALTER TABLE uploaded_materials ADD COLUMN role_id UUID;",
            "ALTER TABLE uploaded_materials ADD COLUMN course_id UUID;",
            "ALTER TABLE uploaded_materials ADD COLUMN context VARCHAR DEFAULT 'standalone_upload';",
            "ALTER TABLE uploaded_materials ADD COLUMN extracted_chunks JSONB;",
            "ALTER TABLE uploaded_materials ALTER COLUMN uploaded_by DROP NOT NULL;",
        ]:
            try:
                conn.execute(text(sql))
                conn.commit()
            except Exception:
                pass

ensure_schema_migrations()


def get_db():
    """FastAPI dependency: yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
