# AI Skill Intelligence Platform — Repo Skeleton

## Why it's structured this way

The core design decision: **business logic never talks to iGOT/NSSTA/mock
data directly.** Everything external comes in through an *adapter* that
implements a shared interface, gets *synced* into our own Postgres tables,
and only then is it touched by the gap engine, recommendation engine, or
dashboards.

```
Mock JSON ──┐
            ├──► Adapter (CourseCatalogProvider) ──► sync service ──► DB ──► business logic
Real iGOT ──┘         (same interface either way)
```

**When real API access arrives:** write one new class implementing
`CourseCatalogProvider` (see the commented sketch at the bottom of
`mock_adapter.py`), flip `COURSE_CATALOG_PROVIDER=igot` in `.env`, done.
Nothing in `app/domain/`, `app/api/`, or the frontend changes.

**What ISN'T free**, so don't oversell this in the demo: field-name/ID
mapping between iGOT's real competency tags and ours (`external_competency_crosswalk`
table exists for exactly this), and real OAuth/SSO complexity if that's
swapped too.

## Folder structure

```
app/
  domain/              # pure business logic — no I/O, no DB, no HTTP.
                        # gap_engine.py, evidence_scorer.py, recommendation_engine.py go here.
  adapters/
    course_catalog/    # CourseCatalogProvider interface + mock/real implementations
    training_calendar/ # same pattern for NSSTA TPAC calendar (stub — build like course_catalog)
    auth/               # same pattern for login/SSO (stub)
  services/            # orchestration: sync jobs, wiring adapters to the DB
  api/                 # FastAPI routers — thin, call into domain/ and services/
  db/                  # SQLAlchemy models (mirrors db/schema.sql), session setup
config.py              # THE ONE FILE that picks which adapter runs, via env vars
db/schema.sql          # full Postgres DDL, with source_system/external_id columns
                        # baked into every table that's a future swap point
scripts/                # one-off scripts (seed_from_mock.py, etc.)
```

## Local dev

```
docker compose up          # postgres+pgvector, backend, frontend
python scripts/seed_from_mock.py   # populates DB from mock_course_catalog.json
                                    #  via the exact same sync path a real
                                    #  API sync would use
```
