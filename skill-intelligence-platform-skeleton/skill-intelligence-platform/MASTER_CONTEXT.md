# MASTER CONTEXT — AI Skill Intelligence Platform (SIH 2026)
> **For whoever picks this up next — human or AI.**
> Read this file top to bottom before touching any code. It is the single source of truth for the full project picture: what we're building, why, all design decisions made, what data exists, what's built vs not built, and the exact demo to target.

---

## 1. THE PROBLEM (SIH 2026 — Problem Statement ID: 26101)

**Organisation:** MoSPI (Ministry of Statistics and Programme Implementation)
**Department:** Data Informatics & Innovation Division (DIID)
**Theme:** Smart Education | **Category:** Software

### What MoSPI is asking for
An **AI-enabled Learning Management System** for officials in India's Official Statistical System (ISS/SSS cadre) that:
1. Assesses an official's current competency level from their profile
2. Identifies skill gaps vs. what their role requires
3. Recommends personalized learning pathways from iGOT Karmayogi and NSSTA courses
4. Generates MCQs and quizzes from uploaded learning materials
5. Provides learner + admin dashboards with analytics

### What we're ACTUALLY building (the deeper insight)
**NOT "another AI LMS."**
We are building a **Statistical Workforce Skill Intelligence Engine** — an explainable AI system that sits *on top of* iGOT + NSSTA resources and:
- Maps an official's role and evidence to their current competency profile
- Calculates skill gaps against a structured, role-specific competency framework
- Recommends courses with *explained reasoning* (not black-box AI)
- Assesses learning via source-grounded MCQs
- Updates the competency profile in a closed loop

### Our competitive differentiation (vs AI-CBP and generic LMS tools like Degreed/Docebo)
| Generic LMS | Our System |
|---|---|
| "AI recommends courses" | Explainable competency graph with evidence |
| Covers all ministries generically | Deep in Official Statistics specifically |
| Opaque scoring | Named formula with fixed weights — auditable |
| Course completion = done | Closed loop: score updates after assessment |
| LLM decides competency | Deterministic rules + LLM only for extraction |

**The pitch in one sentence:**
> "We go deep into Official Statistics with an explainable competency scoring engine, role-specific gap analysis, and a closed learning loop — not a generic AI course recommender."

---

## 2. THE COMPETENCY FRAMEWORK

### Layer 1 — KCM (Karmayogi Competency Model) — Government-wide
Source: `KCM_Master_Table_Verified_From_PDF.xlsx` (verified from CBC PDF — do NOT modify source fields)

**34 total KCM competencies:**

| Category | Count | Competencies |
|---|---|---|
| Behavioural – Core (B01-B08) | 8 | Self-Awareness, Personal Effectiveness, Solution Orientation, Communication, Outcome Orientation, Collaboration, Service Orientation, Operational Excellence |
| Behavioural – Leadership (B09-B13) | 5 | Creativity & Innovation, Strategic Leadership, Collaborative Leadership, Team Leadership, Decision Making |
| Functional (F01-F21) | 21 | Citizen Centricity, Policy Architecture, Cabinet Note Preparation, Govt Program Formulation, Project Management, Public Procurement (GFR), Material Management (GFR), Monitoring & Evaluation, Financial Management, Digital Fluency, Data Analytics, Establishment & HR, Office Management, Handling Parliamentary Matters, Handling RTI Matters, Grievance Redressal, Vigilance Administration, Litigation Management, Information & Communication Management, Change Management, Administration Matters |

**RULE: Do NOT put Official Statistics competencies into the KCM workbook. They are a separate domain ontology.**

### Layer 2 — Domain Competencies (Official Statistics-specific)
Source: `Role_Competency_Matrix_and_Scoring_Model_v2.xlsx` > Sheet: `Domain_Competencies`

**35 total domain competencies** across 4 categories:

#### Statistical (OS-01 to OS-12)
| Code | Competency | PS-Mandated? | Notes |
|---|---|---|---|
| OS-01 | Survey Design | Yes | |
| OS-02 | Sampling Methodology | Yes | |
| OS-03 | National Accounts (GDP) | Yes | |
| OS-04 | Price Statistics | Yes | |
| OS-05 | Labour Statistics | Yes | |
| OS-06 | Agricultural Statistics | Yes | |
| OS-07 | Industrial Statistics | Yes | |
| OS-08 | SDG Indicators | Yes | |
| OS-09 | Metadata Standards | Yes | cross-check vs MoSPI NMDS/CMMI |
| OS-10 | Data Quality Frameworks | Yes | cross-check vs MoSPI SQAF |
| OS-11 | Time Series & Applied Econometrics | No | NEW — confirmed from NSSTA FY26-27 calendar |
| OS-12 | Financial Statistics | No | NEW — confirmed from NSSTA FY26-27 calendar |

#### Technical (TC-01 to TC-12)
| Code | Competency | Code | Competency |
|---|---|---|---|
| TC-01 | Python | TC-07 | GIS |
| TC-02 | R | TC-08 | Data Visualization |
| TC-03 | SQL | TC-09 | AI/ML |
| TC-04 | Stata | TC-10 | Cloud Computing |
| TC-05 | SPSS | TC-11 | APIs |
| TC-06 | SAS | TC-12 | Open Data |

#### Digital Governance (DG-01 to DG-05)
DG-01 Cybersecurity | DG-02 Data Privacy | DG-03 Digital Signatures | DG-04 Government Cloud | DG-05 Digital Public Infrastructure

#### Behavioural & Managerial (BM-01 to BM-06)
| Code | Competency | KCM Reference | Rule |
|---|---|---|---|
| BM-01 | Leadership | B10/B11/B12 | Reference KCM, do NOT duplicate |
| BM-02 | Communication | B04 | Reference KCM, do NOT duplicate |
| BM-03 | Project Management | F05 | Reference KCM, do NOT duplicate |
| BM-04 | Ethics | No direct KCM match | Confirmed from ICCG/ASCI training |
| BM-05 | Decision Making | B13 | Reference KCM, do NOT duplicate |
| BM-06 | Change Management | F20 | Reference KCM, do NOT duplicate |

---

## 3. ROLES

Source: `Role_Competency_Matrix_and_Scoring_Model_v2.xlsx` > Sheet: `Roles`

| Role | Cadre | Description |
|---|---|---|
| JSO | SSS | Junior Statistical Officer — entry level |
| SSO | SSS | Senior Statistical Officer |
| MCTP-II | ISS | Mid-Career Training Programme Level II |
| MCTP-III | ISS | Mid-Career Training Programme Level III — senior |

> **Important caveat:** JSO/SSO are SSS-cadre grades; MCTP-II/III are ISS-cadre milestones — two separate real service hierarchies simplified into one illustrative ladder for MVP. Say so if asked.

**Proficiency Scale:** 1=Awareness | 2=Basic | 3=Working proficiency | 4=Advanced | 5=Expert

---

## 4. THE SCORING MODEL

Source: `Role_Competency_Matrix_and_Scoring_Model_v2.xlsx` > Sheets: `Evidence_Scoring_Model`, `Raw_Score_Conversion_Rules`

### The Formula
```
Competency Score (0-5) =
  Assessment       x 0.30   <- Most objective signal
  + Work Experience  x 0.25   <- Relevance-adjusted, not just tenure
  + Prior Training   x 0.20   <- Completion alone != mastery
  + Education        x 0.15   <- One-time signal
  + Self-report      x 0.10   <- Least objective, direct 1-5 pass-through
```

### Deterministic Conversion Rules
**The LLM NEVER assigns 0-5 scores directly. These deterministic rules do.**

| Evidence | Rule |
|---|---|
| A. Assessment (0.30) | Raw Score = Test percentage / 20  (e.g. 68% -> 3.4) |
| B. Work Experience (0.25) | Years-band x Relevance Factor, capped at 5. Bands: 0-1yr=1, 1-3yr=2, 3-6yr=3, 6-10yr=4, 10+yr=5. Relevance: Direct=1.0, Adjacent=0.6, Tangential=0.3, Unrelated=0 |
| C. Prior Training (0.20) | MAX across completed courses: None=0, Completed/no-assessment=2, Beginner+passed=3, Intermediate+passed=4, Advanced+passed=5 |
| D. Education (0.15) | 1=unrelated, 2=unrelated+relevant coursework, 3=adjacent field bachelor's, 4=direct field bachelor's, 5=direct field master's/PhD |
| E. Self-report (0.10) | Direct 1-5 pass-through, no conversion |

### Gap Calculation
```
Gap = Required Level (from Role_Competency_Matrix) - Person's Current Score
```

### Gap Bands
- **Category A** — Gap = 0: No/minimal gap
- **Category B** — Gap 0-1.5: Slight gap
- **Category C** — Gap > 1.5: Considerable gap — prioritize in recommendations

### Worked Example (Python, Statistical Officer)
| Evidence | Weight | Raw Score | Contribution |
|---|---|---|---|
| Assessment (68% test) | 0.30 | 3.4 | 1.02 |
| Experience (2 yrs, high relevance) | 0.25 | 3.0 | 0.75 |
| Training (iGOT Python Basics completed) | 0.20 | 2.5 | 0.50 |
| Education (B.Sc Statistics) | 0.15 | 2.0 | 0.30 |
| Self-report ("comfortable") | 0.10 | 3.5 | 0.35 |
| **Final Score** | | | **2.92** |

---

## 5. THE ROLE-COMPETENCY MATRIX

Source: `Role_Competency_Matrix_and_Scoring_Model_v2.xlsx` > Sheet: `Role_Competency_Matrix`

Required proficiency (1-5) per competency per role (sample):

| Code | Competency | JSO | SSO | MCTP-II | MCTP-III |
|---|---|---|---|---|---|
| OS-01 | Survey Design | 2 | 3 | 4 | 5 |
| OS-02 | Sampling | 2 | 3 | 4 | 5 |
| TC-01 | Python | 2 | 3 | 3 | 4 |
| TC-09 | AI/ML | 2 | 3 | 3 | 4 |
| DG-02 | Data Privacy | 3 | 4 | 4 | — |
| BM-01 | Leadership | 2 | 4 | 5 | — |
| BM-04 | Ethics | 3 | 4 | 5 | — |

> WARNING: All required-level numbers are prototype estimates, NOT officially sourced. Must disclose if asked by judges.

---

## 6. MOCK COURSE CATALOG

Source: `mock_course_catalog.json` — 50 synthetic courses, 33 competencies covered.

### Course JSON Schema
```json
{
  "course_id": "MOCK-iGOT-OS-01-BEG",
  "title": "Foundations of Survey & Questionnaire Design",
  "provider_type": "iGOT",
  "provider_name": "iGOT Karmayogi",
  "delivery_mode": "Self-paced",
  "level": "Beginner",
  "duration_hours": 3,
  "modules_count": 4,
  "has_final_assessment": true,
  "practice_tests_count": 2,
  "price": "Free",
  "license": "CC BY 4.0",
  "competencies": [
    { "competency_id": "OS-01", "competency_name": "Survey Design" }
  ],
  "source_note": "SYNTHETIC - fictional prototype record, not real iGOT/NSSTA catalog data"
}
```

**CRITICAL: Every record is synthetic. Never claim real iGOT/NSSTA catalog access.**
- iGOT courses: Self-paced delivery
- NSSTA courses: Instructor-led delivery

---

## 7. SYSTEM ARCHITECTURE

### The Core Principle
> Business logic NEVER talks to mock data or real APIs directly. It only reads from our own Postgres DB, populated by a swappable adapter. This means everything built against mock data works identically with a real API — only the adapter class changes.

```
Data Sources:
  mock_course_catalog.json -+
  Real iGOT API (future)   -+-> CourseCatalogProvider (interface)
                                       |
                              MockCourseCatalogAdapter   <- runs today
                              IGOTCourseCatalogAdapter   <- future (same interface)
                                       |
                              catalog_sync.py -> PostgreSQL DB
                                                       |
                                              Gap Engine (domain/)
                                              Recommendation Engine (domain/)
                                              Assessment Engine (domain/)
                                                       |
                                              FastAPI -> React Frontend
```

### Folder Structure
```
app/
  domain/                   <- PURE business logic. No I/O, no DB, no HTTP.
    gap_engine.py               <- TO BUILD
    evidence_scorer.py          <- TO BUILD
    recommendation_engine.py    <- TO BUILD
    mcq_engine.py               <- TO BUILD
    profile_extractor.py        <- TO BUILD (LLM -> structured facts)
  adapters/
    course_catalog/
      base.py                   <- DONE: CourseRecord + CourseCatalogProvider ABC
      mock_adapter.py           <- DONE: reads mock_course_catalog.json
      igot_adapter.py           <- TO BUILD when real API access granted
    training_calendar/          <- STUB (build same pattern as course_catalog)
    auth/                       <- STUB (build same pattern)
  services/
    catalog_sync.py             <- DONE: adapter -> DB sync
    gap_service.py              <- TO BUILD: orchestrates evidence_scorer + gap_engine
    recommendation_service.py   <- TO BUILD
    assessment_service.py       <- TO BUILD
  api/                          <- TO BUILD: FastAPI routers (thin, call domain/)
    officers.py
    competencies.py
    recommendations.py
    assessments.py
    admin.py
  db/                           <- TO BUILD
    models.py                       SQLAlchemy ORM mirroring schema.sql
    session.py                      DB session setup
  config.py                    <- DONE: picks adapters via env vars

db/
  schema.sql                   <- DONE: full PostgreSQL schema

scripts/
  seed_from_mock.py            <- TO BUILD: seed all data into DB
```

### Environment Variables (config.py)
```
COURSE_CATALOG_PROVIDER=mock        # 'mock' | 'igot'
TRAINING_CALENDAR_PROVIDER=mock     # 'mock' | 'nssta'
AUTH_PROVIDER=mock                  # 'mock' | 'parichay_sso'
MOCK_CATALOG_PATH=data/mock_course_catalog.json
DATABASE_URL=postgresql://...
OPENAI_API_KEY=...                  # or GOOGLE_API_KEY for Gemini
```

---

## 8. THE 4 AI ENGINES TO BUILD

### Engine 1 — Evidence Extractor (LLM role)
**Input:** Unstructured official profile (CV, designation, experience, training history)
**Output:** Structured JSON of raw evidence facts
```json
{
  "designation": "Statistical Officer",
  "experience_years": 4,
  "experience_relevance": "Direct",
  "education": { "degree": "M.Sc Statistics", "field_match": "Direct" },
  "prior_training": ["iGOT Sampling Basics (completed)", "NSSTA Survey Design (completed)"],
  "self_report": { "Python": 3, "Sampling": 4 },
  "assessment_scores": { "TC-01": 68 }
}
```
**FILE:** `app/domain/profile_extractor.py`
**RULE:** LLM extracts facts ONLY. Deterministic conversion rules produce 0-5 scores.

### Engine 2 — Gap Engine (Pure Deterministic Function)
```python
# app/domain/gap_engine.py
def calculate_gap(officer_profile, role_code) -> GapReport:
    scores = evidence_scorer.score(officer_profile)    # 5-factor formula
    required = role_matrix.get_required(role_code)     # from DB
    gaps = {code: required[code] - scores[code] for code in required}
    categories = {code: categorize_gap(gap) for code, gap in gaps.items()}
    return GapReport(scores=scores, required=required, gaps=gaps, categories=categories)
```
Test standalone before wiring to API. No I/O in this function.

### Engine 3 — Recommendation Engine (Explainable)
Recommendation score formula:
```
Score = 0.35 x RoleMatch
      + 0.25 x SkillGapSize        <- bigger gap = higher priority
      + 0.15 x LevelMatch          <- course level vs. current competency
      + 0.15 x Priority            <- PS-mandated competencies ranked higher
      + 0.10 x LearningHistory     <- not taken before = higher score
```

Every recommendation MUST include a human-readable explanation string:
> "Recommended because: Your role requires Advanced Sampling (level 4), your current level is 2, and this course directly addresses that gap."

**Implementation:** pgvector semantic similarity of competency descriptions vs. course descriptions + the formula above. Do NOT prompt LLM to pick courses.

### Engine 4 — Assessment Engine (MCQ Generation)
**Pipeline:**
```
Upload (PDF/DOCX/PPT/TXT)
  -> Text extraction (PyMuPDF / python-docx)
  -> Chunking (by paragraph/section, store page reference)
  -> Embeddings + pgvector storage
  -> LLM prompt with source chunk (strict JSON output)
  -> MCQ: { question, options[4], correct_answer, explanation, source_page }
  -> Validation (answer in options, no duplicates, source-grounded)
  -> Serve to learner -> score -> update competency
```

**MCQ prompt must always specify:** topic (competency code), difficulty level, Bloom's taxonomy level, source chunk text (LLM must only use this, not general knowledge).

**CRITICAL:** Never claim MCQs are automatically authoritative. Store source_chunk_id + source_page on every question. Support trainer review before deployment.

### The Closed Loop (The Demo's Money Moment)
```
Gap identified (e.g. Sampling: current=2.0, required=4.0, gap=2.0, Category C)
  -> Course recommended (Sampling Techniques - Intermediate)
  -> Learner takes MCQ assessment
  -> Score: 74% -> Assessment raw score = 74/20 = 3.7
  -> New competency score = 3.7*0.30 + prev_other_components = 3.4
  -> Gap reduced: 4.0 - 3.4 = 0.6 (Category B)
  -> Next recommendation adjusted: "Sampling gap reduced. Next: Advanced Sampling."
```

---

## 9. DATABASE SCHEMA (Key Tables)

Source: `db/schema.sql` (DONE)

- `competencies` — all 35 domain competencies (OS-*, TC-*, DG-*, BM-*)
- `roles` — JSO, SSO, MCTP-II, MCTP-III
- `role_competency_requirements` — required level per role x competency
- `courses` — synced from adapter (mock or real iGOT)
- `course_competencies` — many-to-many: course <-> competency
- `external_competency_crosswalk` — maps iGOT's real tags to our OS-*/TC-* codes
- `officers` — official profiles
- `officer_competency_scores` — current 0-5 score per officer x competency + evidence breakdown
- `assessments` — MCQ sessions and results
- `learning_history` — enrollments and completions
- `uploaded_documents` — source tracking for MCQ generation
- `mcq_questions` — generated questions with source_chunk_id + source_page

**pgvector columns used for:**
1. Course embeddings (semantic similarity search for recommendations)
2. Competency description embeddings
3. Document chunk embeddings (MCQ source retrieval)

---

## 10. FRONTEND PLAN

**Stack:** React + Recharts/Chart.js + Tailwind CSS

### Learner Dashboard (Priority: Critical)
- Competency Radar Chart — all 35 competencies, current vs. required overlay
- Gap Summary Cards — Category A/B/C with colour coding (green/yellow/red)
- Recommended Learning Path — top 3-5 courses with explanation text
- Progress Tracker — competency scores over time (before/after assessments)
- Quiz Interface — take MCQ, instant feedback + source reference shown

### Admin Dashboard (Priority: High)
- Workforce Heatmap — org-wide competency grid (role x competency)
- Training Effectiveness — avg competency before/after per course
- Critical Gaps — department-wide top skill shortages

### Workforce Readiness Score (The Memorable Demo Feature)
```
Overall Workforce Readiness: 67%

Domain               Score  Bar
Official Statistics   82%   xxxxxxxx..
Data Science          48%   xxxx......
Programming           61%   xxxxxx....
GIS                   35%   xxx.......
Digital Governance    74%   xxxxxxx...
Management            68%   xxxxxx....

Target Role Simulation:
  Target: Senior Statistical Analyst | Current Readiness: 68%
  Missing: [RED] GIS  [RED] Advanced ML  [YELLOW] Data Quality
  Recommended Path: 1. GIS for Statistics  2. Advanced Python  3. ML for Official Statistics
```

---

## 11. WHAT IS BUILT vs. WHAT IS NOT

### Done
| Item | Location |
|---|---|
| KCM competency table (34) | KCM_Master_Table_Verified_From_PDF.xlsx |
| Domain competency ontology (35) | Role_Competency_Matrix_and_Scoring_Model_v2.xlsx |
| Role-competency matrix (required levels) | Same xlsx, Role_Competency_Matrix sheet |
| Scoring formula + conversion rules | Same xlsx, Evidence_Scoring_Model + Raw_Score_Conversion_Rules |
| Mock course catalog (50 courses) | mock_course_catalog.json |
| Adapter pattern + repo skeleton | skill-intelligence-platform/ |
| CourseRecord + CourseCatalogProvider interface | app/adapters/course_catalog/base.py |
| MockCourseCatalogAdapter | app/adapters/course_catalog/mock_adapter.py |
| catalog_sync.py | app/services/catalog_sync.py |
| config.py (adapter selection) | app/config.py |
| PostgreSQL schema | db/schema.sql |

### To Build
| Item | Priority |
|---|---|
| scripts/seed_from_mock.py | CRITICAL |
| app/domain/evidence_scorer.py | CRITICAL |
| app/domain/gap_engine.py | CRITICAL |
| app/domain/profile_extractor.py (LLM extractor) | CRITICAL |
| app/domain/recommendation_engine.py | CRITICAL |
| app/domain/mcq_engine.py | CRITICAL |
| app/db/models.py + session.py | CRITICAL |
| app/api/ (all FastAPI routers) | CRITICAL |
| app/services/gap_service.py | High |
| app/services/recommendation_service.py | High |
| app/services/assessment_service.py | High |
| React frontend (learner dashboard) | High |
| React frontend (admin dashboard) | Medium |
| app/adapters/course_catalog/igot_adapter.py | Future only |

---

## 12. BUILD ORDER (12 Days)

```
Days 1-3  BACKEND FOUNDATION
  - Stand up Postgres + pgvector (docker-compose)
  - Write app/db/models.py (SQLAlchemy ORM)
  - Write scripts/seed_from_mock.py (load all data)
  - Write app/domain/evidence_scorer.py (pure function, test standalone)
  - Write app/domain/gap_engine.py (pure function, test standalone)

Days 4-6  AI / RAG LAYER
  - Write app/domain/profile_extractor.py (LLM -> structured JSON)
  - Embed 50 courses into pgvector
  - Write app/domain/recommendation_engine.py (semantic + weighted formula)
  - Write app/domain/mcq_engine.py (PDF -> MCQ pipeline)
  - Wire up FastAPI routers in app/api/

Days 7-9  FRONTEND
  - Learner dashboard: radar chart + gap cards
  - Recommended courses view with explanation text
  - MCQ quiz interface
  - Wire to real API endpoints

Days 10-11  CLOSED LOOP + POLISH
  - Post-assessment competency update pipeline
  - Workforce Readiness Score calculation
  - Admin heatmap dashboard
  - End-to-end demo run-through

Day 12  DEMO PREP
  - "Meet Officer X" demo narrative
  - Judge Q&A rehearsal
  - Integration Assumptions Register review
```

---

## 13. THE DEMO SCRIPT

**Input:**
```
Designation: Statistical Officer | Department: MoSPI
Experience: 4 years | Education: M.Sc Statistics
Previous Training: iGOT Sampling Basics (completed)
Current Assignment: Survey Data Analysis
```

**Step 1 — Profile -> Competency Radar**
- System shows current scores vs. required levels for Statistical Officer
- Gap areas highlighted red

**Step 2 — Gap Analysis Output**
```
[RED]    GIS           Current: 1.5, Required: 3, Gap: 1.5 (Category C)
[YELLOW] Python        Current: 2.5, Required: 3, Gap: 0.5 (Category B)
[YELLOW] Survey Design Current: 3.0, Required: 4, Gap: 1.0 (Category B)
```

**Step 3 — Recommended Courses (with explanations)**
```
#1 GIS for Official Statistics — 92% relevance
   "Recommended because: Your role requires level 3 GIS. Current: 1.5.
    This NSSTA course directly addresses the gap."

#2 Python for Data Analysis — 88% relevance
   "Recommended because: ..."
```

**Step 4 — MCQ Generation**
- Upload NSSTA Sampling Methodology PDF
- System generates 10 source-grounded MCQs
- Officer takes quiz -> scores 74%

**Step 5 — THE MONEY MOMENT (Closed Loop)**
```
Before quiz: Sampling = 2.8/5
After quiz (74% -> 3.7 raw score):
  New Assessment contribution = 3.7 x 0.30 = 1.11
  New Sampling Score = 3.4  (was 2.8)
  Gap reduced: 1.6 -> 1.0  (Category C -> Category B)

System: "Sampling gap reduced from 1.6 to 1.0.
         Next recommended: Advanced Sampling Techniques."
```

**THIS is the demo. Everything else is secondary.**

---

## 14. INTEGRATION ASSUMPTIONS REGISTER

| Item | Reality | What to Say |
|---|---|---|
| iGOT course catalog | 50 synthetic mock courses | "Prototype uses API-compatible mock dataset. Production requires real iGOT API credentials — adapter class is ready." |
| iGOT competency tags | Our OS-*/TC-* codes, not real iGOT tags | "external_competency_crosswalk table handles tag resolution for real API." |
| NSSTA training calendar | Not integrated (stub adapter exists) | "NSSTA adapter stub exists; integration follows same pattern as iGOT." |
| Required competency levels | Prototype estimates, not officially sourced | "Prototype estimates — intended for domain expert validation in ~30 min." |
| Officer profile data | Demo/synthetic data only | "Production draws from e-HRMS or equivalent government HR system." |
| Parichay SSO | Not implemented (auth stub exists) | "Auth adapter stub ready; production connects to Parichay SSO." |
| pgvector embeddings | OpenAI/Cohere or local model | "Embedding model configurable; production uses government-approved model." |

---

## 15. JUDGE Q&A — KEY ANSWERS

**"Isn't this just ChatGPT + iGOT?"**
> "No. LLM is one component only — it extracts unstructured facts from profiles and generates source-grounded MCQs. The competency scoring uses a deterministic 5-factor formula with fixed weights. Gap calculation is simple arithmetic. Recommendations use a named scoring formula plus semantic course matching. Every score is explainable — we can answer 'why is this person 3.2 in Sampling' with a calculation, not a shrug."

**"iGOT already has competency-based learning. What are you adding?"**
> "We don't compete with iGOT — we're its intelligence layer for Official Statistics. We add domain-specific gap assessment, NSSTA integration, explainable scoring, and a closed learning loop that updates competency scores after assessment. That closed loop doesn't exist in iGOT today."

**"How do you know competency score is 3.2 and not 3.0?"**
> "The score is a formula: 30% assessment + 25% experience + 20% training + 15% education + 10% self-report. Each input is converted by deterministic rules — e.g. 68% test = 3.4 (68/20). No LLM judgment in the final score. We can show the full calculation for any competency."

**"What if iGOT API isn't available?"**
> "Our architecture separates the intelligence engine from the learning provider via an adapter interface. We use a mock dataset with iGOT-compatible schema. When API credentials are available, we implement IGOTCourseCatalogAdapter — same interface, no changes to the recommendation engine or frontend."

**"How do you prevent hallucinated MCQs?"**
> "Questions are generated from retrieved source passages only, not model general knowledge. Every question stores its source chunk ID and page number. We run validation: answer must be in options, no duplicate options. High-stakes questions can be flagged for trainer review."

---

## 16. TECHNOLOGY STACK

| Layer | Technology |
|---|---|
| Backend | FastAPI (Python) |
| Database | PostgreSQL + pgvector extension |
| ORM | SQLAlchemy |
| AI/LLM | OpenAI GPT-4o / Google Gemini (configurable) |
| Embeddings | text-embedding-3-small or equivalent |
| PDF parsing | PyMuPDF (fitz) |
| DOCX parsing | python-docx |
| Frontend | React + Recharts + Tailwind CSS |
| Auth (now) | JWT (mock) |
| Auth (future) | Parichay SSO |
| Deployment | Docker Compose -> cloud-ready |

### Python Dependencies
```
fastapi uvicorn sqlalchemy psycopg2-binary pgvector
openai python-docx PyMuPDF python-pptx
pandas openpyxl python-dotenv httpx pydantic
```

---

## 17. TEAM GROUND RULES

1. **LLM never assigns final competency scores.** It extracts raw facts. Deterministic rules produce 0-5. If tempted to prompt "what level is this person?" — stop.

2. **Never claim live iGOT/NSSTA integration** in code, pitch, or under questioning. Say "adapter ready."

3. **Every non-primary-source number gets labeled.** "Prototype estimate" is fine. Wrong-but-confident is not.

4. **Domain logic is in `app/domain/`.** No I/O, no DB calls, no HTTP there. Test standalone before wiring to API.

5. **Scope discipline.** 4 excellent features >> 15 mediocre ones.

6. **Do NOT build:** voice assistants, AR/VR, blockchain, complex predictive ML, microservices, real-time analytics on fake data.

---

## 18. FILE INDEX

| File/Folder | Description | Status |
|---|---|---|
| `KCM_Master_Table_Verified_From_PDF.xlsx` | 34 KCM competencies verified from CBC PDF | Done |
| `Role_Competency_Matrix_and_Scoring_Model_v2.xlsx` | Roles, 35 domain competencies, matrix, scoring model | Done |
| `mock_course_catalog.json` | 50 synthetic courses (iGOT + NSSTA style) | Done |
| `AI Skill Intelligence Platform.docx` | Team planning doc: strategy, tracks, scope | Done |
| `skill-intelligence-platform/README.md` | Adapter pattern explanation | Done |
| `skill-intelligence-platform/MASTER_CONTEXT.md` | **This file** — full project picture | Done |
| `skill-intelligence-platform/db/schema.sql` | Full PostgreSQL schema with pgvector | Done |
| `skill-intelligence-platform/app/adapters/course_catalog/base.py` | CourseRecord + Provider interface | Done |
| `skill-intelligence-platform/app/adapters/course_catalog/mock_adapter.py` | Mock adapter (reads JSON) | Done |
| `skill-intelligence-platform/app/services/catalog_sync.py` | Adapter -> DB sync | Done |
| `skill-intelligence-platform/app/config.py` | Adapter selection via env vars | Done |
| `skill-intelligence-platform/app/domain/` | Gap engine, evidence scorer, recommendation, MCQ | TO BUILD |
| `skill-intelligence-platform/app/api/` | FastAPI routers | TO BUILD |
| `skill-intelligence-platform/app/db/` | SQLAlchemy models + session | TO BUILD |
| `skill-intelligence-platform/scripts/seed_from_mock.py` | Seed all data into DB | TO BUILD |
| `frontend/` | React app (create separately) | TO BUILD |
