"""
Assessments Router — Upload training material, generate MCQs via RAG LLM, and submit quiz for CLOSED LOOP competency update.
"""
import os
import shutil
from typing import Dict, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.config import UPLOAD_DIR
from app.db.session import get_db
from app.db.models import Assessment, AssessmentQuestion, Official
from app.services.assessment_service import create_assessment_from_upload, submit_quiz_and_update_competency

router = APIRouter(prefix="/assessments", tags=["Assessments & MCQ Engine"])


class QuizSubmitRequest(BaseModel):
    officer_id: str
    answers: Dict[int, str]    # {question_index: selected_option_id} (e.g. {0: "b", 1: "a"})


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_material_and_generate_mcqs(
    officer_id: str = Form(...),
    competency_code: str = Form(...),
    total_questions: int = Form(default=10),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Upload learning material (PDF/DOCX/TXT) and generate source-grounded MCQs via LLM.
    Returns generated assessment questions ready for the learner to take.
    """
    official = db.query(Official).filter_by(id=officer_id).first()
    if not official:
        raise HTTPException(status_code=404, detail="Officer not found")

    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_location = os.path.join(UPLOAD_DIR, f"{officer_id}_{file.filename}")

    try:
        with open(file_location, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

    try:
        result = create_assessment_from_upload(
            db=db,
            officer_id=officer_id,
            competency_code=competency_code.upper(),
            filepath=file_location,
            filename=file.filename,
            total_questions=total_questions,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MCQ generation failed: {str(e)}")

    return result


@router.get("/{assessment_id}")
def get_assessment_details(assessment_id: str, db: Session = Depends(get_db)):
    """Fetch assessment session questions (hides correct options for live test taking)."""
    assessment = db.query(Assessment).filter_by(id=assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = db.query(AssessmentQuestion).filter_by(assessment_id=assessment_id).all()

    return {
        "assessment_id": assessment.id,
        "officer_id": assessment.official_id,
        "total_questions": len(questions),
        "questions": [
            {
                "index": i,
                "question_text": q.question_text,
                "options": q.options,
                "difficulty": q.difficulty,
                "source_excerpt_ref": q.source_excerpt_ref,
            }
            for i, q in enumerate(questions)
        ],
    }


@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: str,
    payload: QuizSubmitRequest,
    db: Session = Depends(get_db),
):
    """
    Submit completed quiz answers.
    Scores quiz, writes new Assessment evidence, and RECOMPUTES COMPETENCY SCORE (CLOSED LOOP).
    Returns score before, score after, and gap reduction metrics.
    """
    try:
        result = submit_quiz_and_update_competency(
            db=db,
            officer_id=payload.officer_id,
            assessment_id=assessment_id,
            answers=payload.answers,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Quiz submission failed: {str(e)}")

    return result
