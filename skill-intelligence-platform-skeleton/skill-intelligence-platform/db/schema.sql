-- ============================================================================
-- AI Skill Intelligence Platform — Database Schema
-- ============================================================================
-- DESIGN PRINCIPLE: Every table that could one day be populated from a real
-- external system (iGOT courses, NSSTA calendar, enrollments) carries:
--   source_system   -- 'mock' | 'igot' | 'nssta'  (which adapter wrote this row)
--   external_id     -- the ID in that external system, NULL for mock/native data
--   synced_at       -- when this row was last refreshed by an adapter
-- Business logic (gap engine, recommendation engine) reads ONLY from these
-- tables. It never knows or cares whether a row came from a JSON file or a
-- live API call. Swapping the data source means writing one new adapter and
-- flipping a config value — this schema does not change.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS vector;   -- pgvector, for competency<->course semantic matching
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------------------------------
-- COMPETENCY LAYER  (our own domain ontology — not swapped from an external
-- API; no official Official-Statistics competency API exists. If CBC ever
-- exposes KCM as an API, treat it the same way: add source_system here too.)
-- ----------------------------------------------------------------------------

CREATE TABLE competencies (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                TEXT UNIQUE NOT NULL,          -- e.g. 'OS-01', 'TC-09', 'BM-02'
    name                TEXT NOT NULL,
    competency_type     TEXT NOT NULL CHECK (competency_type IN ('behavioural','functional','domain')),
    domain_category     TEXT,                          -- 'Statistical' | 'Technical' | 'Digital Governance' | 'Behavioural & Managerial' | NULL for KCM
    kcm_mapping_code    TEXT,                           -- e.g. 'B04', 'F05' — NULL if no KCM equivalent
    ps_mandated         BOOLEAN NOT NULL DEFAULT FALSE,
    source_status       TEXT NOT NULL DEFAULT 'prototype', -- 'verified_primary_source' | 'prototype'
    source_note         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE roles (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code                TEXT UNIQUE NOT NULL,           -- 'JSO','SSO','MCTP-II','MCTP-III'
    name                TEXT NOT NULL,
    service_stage       TEXT,                           -- 'SSS, entry grade' etc.
    description         TEXT,
    source_note         TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE role_competency_requirements (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id             UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    required_level      NUMERIC(3,1) NOT NULL CHECK (required_level BETWEEN 0 AND 5),
    priority            TEXT DEFAULT 'standard',        -- 'critical' | 'standard' | 'nice_to_have'
    source_status       TEXT NOT NULL DEFAULT 'prototype',
    UNIQUE (role_id, competency_id)
);

-- ----------------------------------------------------------------------------
-- OFFICIALS (users) AND EVIDENCE
-- ----------------------------------------------------------------------------

CREATE TABLE officials (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name           TEXT NOT NULL,
    designation         TEXT,
    role_id             UUID REFERENCES roles(id),
    department          TEXT,
    email               TEXT UNIQUE,
    -- auth is handled by an adapter (see AuthProvider interface); this just
    -- records which system authenticated them, for future SSO swap
    auth_source_system  TEXT NOT NULL DEFAULT 'mock',   -- 'mock' | 'parichay_sso'
    external_auth_id    TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Every fact used to compute a competency score, before conversion.
-- The LLM only ever writes rows here (raw facts) — never into competency_scores directly.
CREATE TABLE competency_evidence (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    evidence_type       TEXT NOT NULL CHECK (evidence_type IN
                            ('education','experience','prior_training','assessment','self_report')),
    raw_fact            JSONB NOT NULL,   -- e.g. {"years": 2, "relevance": "direct"} or {"test_percent": 68}
    raw_score           NUMERIC(3,2),     -- 0-5, computed by the deterministic conversion rules (never by the LLM)
    weight_applied       NUMERIC(4,3),     -- snapshot of the weight used, for auditability if weights change later
    extracted_by         TEXT DEFAULT 'llm', -- 'llm' | 'manual_entry' | 'assessment_engine'
    source_reference     TEXT,             -- e.g. "CV.pdf, page 2" or "Assessment #123"
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Derived/cached current score per official per competency — recomputed
-- whenever competency_evidence changes for that pair. Kept as a table
-- (not just computed on read) so the gap engine and dashboards are fast.
CREATE TABLE competency_scores (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    current_score       NUMERIC(3,2) NOT NULL CHECK (current_score BETWEEN 0 AND 5),
    confidence          NUMERIC(3,2),        -- optional: how much evidence backs this score
    computed_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (official_id, competency_id)
);

-- ----------------------------------------------------------------------------
-- COURSE CATALOG  (the swap point: mock JSON today, iGOT/NSSTA API tomorrow)
-- ----------------------------------------------------------------------------

CREATE TABLE courses (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system       TEXT NOT NULL DEFAULT 'mock' CHECK (source_system IN ('mock','igot','nssta')),
    external_id         TEXT,             -- the course ID in iGOT/NSSTA once real; NULL for mock
    title               TEXT NOT NULL,
    provider_type       TEXT NOT NULL CHECK (provider_type IN ('iGOT','NSSTA')),
    provider_name       TEXT,
    delivery_mode       TEXT CHECK (delivery_mode IN ('Self-paced','Instructor-led')),
    level               TEXT CHECK (level IN ('Beginner','Intermediate','Advanced')),
    duration_hours      NUMERIC(5,1),
    modules_count       INTEGER,
    has_final_assessment BOOLEAN DEFAULT TRUE,
    practice_tests_count INTEGER DEFAULT 0,
    price               TEXT DEFAULT 'Free',
    license             TEXT,
    synced_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (source_system, external_id)
);

CREATE TABLE course_competencies (
    course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, competency_id)
);

-- Embeddings for semantic gap<->course matching (pgvector). Populated by the
-- same adapter that ingests the course, regardless of source_system.
CREATE TABLE course_embeddings (
    course_id           UUID PRIMARY KEY REFERENCES courses(id) ON DELETE CASCADE,
    embedding            vector(1536)
);

-- ----------------------------------------------------------------------------
-- CROSSWALK TABLE — the piece that makes real-API field mismatches cheap to
-- fix later without touching code. If iGOT's real competency tags don't
-- match our OS-*/TC-*/BM-* codes, map them here instead of writing new logic.
-- ----------------------------------------------------------------------------

CREATE TABLE external_competency_crosswalk (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system       TEXT NOT NULL CHECK (source_system IN ('igot','nssta')),
    external_competency_code TEXT NOT NULL,
    external_competency_name TEXT,
    mapped_competency_id UUID REFERENCES competencies(id),
    mapping_status      TEXT NOT NULL DEFAULT 'unmapped' CHECK (mapping_status IN ('unmapped','mapped','no_equivalent')),
    UNIQUE (source_system, external_competency_code)
);

-- ----------------------------------------------------------------------------
-- ENROLLMENT / COMPLETION  (also a swap point — mock today, real iGOT
-- enrollment API tomorrow)
-- ----------------------------------------------------------------------------

CREATE TABLE enrollments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_system       TEXT NOT NULL DEFAULT 'mock' CHECK (source_system IN ('mock','igot','nssta')),
    external_id         TEXT,
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status              TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled','in_progress','completed','dropped')),
    enrolled_at         TIMESTAMPTZ,
    completed_at        TIMESTAMPTZ,
    synced_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- RECOMMENDATION ENGINE OUTPUT (native to us — nothing to swap here)
-- ----------------------------------------------------------------------------

CREATE TABLE recommendations (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    course_id           UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id),
    gap_at_time         NUMERIC(3,2) NOT NULL,
    score               NUMERIC(4,3) NOT NULL,       -- final ranking score, 0-1
    score_breakdown     JSONB,                        -- {"semantic":0.3,"role_relevance":0.35,...} for explainability
    reason_text         TEXT,                         -- human-readable "recommended because..."
    generated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- AI ASSESSMENT ENGINE (native to us — RAG-generated MCQs, source-cited)
-- ----------------------------------------------------------------------------

CREATE TABLE uploaded_materials (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by         UUID REFERENCES officials(id),
    filename            TEXT NOT NULL,
    competency_id       UUID REFERENCES competencies(id),
    storage_path        TEXT NOT NULL,
    uploaded_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assessments (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    competency_id       UUID NOT NULL REFERENCES competencies(id),
    source_material_id  UUID REFERENCES uploaded_materials(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE assessment_questions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text       TEXT NOT NULL,
    options             JSONB NOT NULL,     -- [{"id":"a","text":"..."}, ...]
    correct_option_id   TEXT NOT NULL,
    explanation         TEXT,
    difficulty          TEXT CHECK (difficulty IN ('easy','medium','difficult','hots')),
    source_excerpt_ref  TEXT                -- e.g. "Page 14, para 3" — for the "grounded in the document" claim
);

CREATE TABLE assessment_results (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assessment_id       UUID NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    official_id         UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    score_percent       NUMERIC(5,2) NOT NULL,
    completed_at        TIMESTAMPTZ NOT NULL DEFAULT now()
    -- NOTE: on insert here, the application layer writes a new row into
    -- competency_evidence (evidence_type='assessment') and recomputes
    -- competency_scores. This is the closed loop.
);

CREATE INDEX idx_evidence_official_competency ON competency_evidence (official_id, competency_id);
CREATE INDEX idx_scores_official ON competency_scores (official_id);
CREATE INDEX idx_course_competencies_competency ON course_competencies (competency_id);
CREATE INDEX idx_enrollments_official ON enrollments (official_id);
CREATE INDEX idx_recommendations_official ON recommendations (official_id, generated_at DESC);
