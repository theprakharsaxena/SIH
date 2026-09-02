# SIH 2026 — Live Hackathon Demo Walkthrough
**Problem Statement ID:** 26101  
**Title:** AI-Enabled Skill Intelligence & Learning Platform for Official Statistical System (MoSPI)

---

## 🚀 How to Run the Platform (2 Terminal Windows)

### Window 1: Backend API (FastAPI)
```bash
cd skill-intelligence-platform-skeleton/skill-intelligence-platform
# Ensure .env has NOVITA_API_KEY set
python3 scripts/seed_from_mock.py
uvicorn app.main:app --reload --port 8000
```
*API & Swagger Docs available at:* `http://localhost:8000/docs`

### Window 2: React Frontend (Vite)
```bash
cd skill-intelligence-platform-skeleton/skill-intelligence-platform/frontend
npm run dev
```
*Frontend Web App available at:* `http://localhost:5173`

---

## 🎭 5-Step Judge Presentation Script

### Step 1: Show the Core Problem & Differentiation
> *"Judges, we didn't build just another generic AI LMS that spits out course recommendations. We built a Statistical Workforce Skill Intelligence Engine specifically for MoSPI officials."*
- Show **Workforce Readiness Score** (67.5% overall readiness across Statistical, Technical, GIS, and Digital Governance).
- Show the **Workforce Skill Heatmap** (Role x Competency grid across JSO, SSO, MCTP-II, MCTP-III).

### Step 2: Show Official Profile & Explainable Gap Analysis
- Switch to **Learner Dashboard**.
- Point out the **Competency Radar Chart** (Current proficiency vs Required role level).
- Click on any Category C (Red) or Category B (Yellow) gap card to reveal the **5-Factor Audit Trail**:
  - `(Assessment * 0.30) + (Experience * 0.25) + (Training * 0.20) + (Education * 0.15) + (Self-report * 0.10)`
  - Point out: *"Every score is 100% deterministic and auditable — no black-box LLM assigns scores directly."*

### Step 3: Demonstrate Unstructured LLM Evidence Extraction
- Click **"Load Sample MoSPI Officer Profile"** in the LLM Profile Extractor box.
- Click **"Extract Evidence & Run Gap Engine"**.
- Watch **Novita AI (DeepSeek)** extract raw facts (years of experience, test scores, degree) and immediately compute updated gaps.

### Step 4: Show Transparent Course Recommendations
- Scroll to **AI Recommended Pathways**.
- Highlight the **"Recommended because..."** badge on each course card:
  - Explains exact reasoning: *"Your role requires level 4.0 Sampling. Current level is 2.8. This intermediate course directly targets that gap."*

### Step 5: THE MONEY MOMENT — The Closed Learning Loop!
- Click **"RAG MCQ Engine (Closed Loop)"** tab or click **"Generate RAG Quiz"** on a course card.
- Upload any sample PDF / text material (or choose `OS-02 Sampling Methodology`).
- Click **"Generate Source-Grounded Quiz"**.
- Take the 5-question test and click **"Submit Answers & Trigger Closed Loop"**.
- Watch the **CLOSED LOOP** animation:
  - Shows Score Before → Score After (+0.6 boost!)
  - Competency score updates live in PostgreSQL
  - Gap is automatically reduced from Category C → Category B
  - Recommendation queue updates dynamically!

---

## 🏆 Defensive Judge Q&A Cheat Sheet

1. **"Isn't this just ChatGPT recommending courses?"**
   > *"No. The LLM is used strictly for raw fact extraction from unstructured CVs and RAG MCQ generation. The competency scoring uses a fixed 5-factor formula, gap calculation is exact arithmetic, and recommendations follow a named 5-weighted ranking formula."*

2. **"How do you handle real iGOT API integration?"**
   > *"We implemented a strict Adapter Pattern (`CourseCatalogProvider`). Today it reads our 50-course mock catalog. When live iGOT credentials are provided, we flip `COURSE_CATALOG_PROVIDER=igot` in `.env` — no business logic changes needed."*

3. **"How do you prevent MCQ hallucinations?"**
   > *"Questions are generated from provided source excerpts only. Each generated MCQ stores its `source_excerpt_ref` (e.g. Page 4, Para 2) directly on the question record."*
