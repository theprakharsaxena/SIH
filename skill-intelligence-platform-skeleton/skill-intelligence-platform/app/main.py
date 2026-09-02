"""
AI Skill Intelligence Platform — Main FastAPI Application.
MoSPI Official Statistical System (SIH 2026 - Problem Statement ID: 26101)
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import (
    auth, officers, competencies, gap, recommendations, assessments, admin
)

app = FastAPI(
    title="AI Skill Intelligence Platform (MoSPI)",
    description=(
        "Statistical Workforce Skill Intelligence Engine for India's Official Statistical System. "
        "Maps roles & evidence to structured competencies, computes explainable gaps, "
        "recommends iGOT/NSSTA courses, and runs source-grounded MCQ assessments in a closed loop."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],    # Allow all origins for dev/hackathon demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all API routers
app.include_router(auth.router)
app.include_router(officers.router)
app.include_router(competencies.router)
app.include_router(gap.router)
app.include_router(recommendations.router)
app.include_router(assessments.router)
app.include_router(admin.router)


@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "system": "AI Skill Intelligence Platform (MoSPI - SIH 2026)",
        "docs": "/docs",
        "adapters": {
            "course_catalog": "mock",
            "training_calendar": "mock",
            "auth": "mock",
        },
    }
