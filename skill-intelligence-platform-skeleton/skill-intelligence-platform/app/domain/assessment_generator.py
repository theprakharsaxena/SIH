"""
app/domain/assessment_generator.py

Ingestion-time batch generation & review orchestrator.

Chains:
  chunk_document -> _generate_mcqs_from_chunk -> validate_numeric_consistency
  -> validate_formula_application -> check_needs_passage -> collect accepted,
  rejected (with rejection stage logs), and flagged_for_review.
"""
from dataclasses import dataclass, field
from typing import Optional

from app.domain.document_chunker import chunk_document, Chunk
from app.domain.numeric_validator import validate_numeric_consistency
from app.domain.formula_verifier import validate_formula_application
from app.domain.depth_validator import check_needs_passage
from app.domain.mcq_engine import _generate_mcqs_from_chunk, MCQQuestion, mcq_to_dict


@dataclass
class RejectedQuestion:
    chunk_id: str
    page_number: Optional[int]
    stage: str          # verbatim_quote | numeric_consistency | formula_verification | depth_check
    reason: str
    question_text: Optional[str] = None


@dataclass
class GenerationResult:
    accepted: list[dict] = field(default_factory=list)
    rejected: list[RejectedQuestion] = field(default_factory=list)
    flagged_for_review: list[dict] = field(default_factory=list)
    skipped_chunks: int = 0


def generate_validated_assessment(
    pages: list[str],
    competency_name: str,
    competency_id: Optional[str] = None,
    max_questions: Optional[int] = None,
) -> GenerationResult:
    """
    Ingestion-time batch generator:
    Runs once when reference document or course material is uploaded.
    Auto-approved items publish immediately; equation-dense or complex formulas flag for review.
    """
    chunks = chunk_document(pages)
    result = GenerationResult()

    for chunk in chunks:
        if max_questions is not None and len(result.accepted) >= max_questions:
            break

        # Check if equation-dense: flag for human review
        if chunk.is_equation_dense:
            flagged_item = {
                "question_text": f"Conceptual question derived from equation-dense chunk (Page {chunk.page_number})",
                "options": [
                    {"id": "a", "text": "Requires manual domain review for advanced Bayesian / matrix derivation"},
                    {"id": "b", "text": "Standard conceptual recall option"},
                    {"id": "c", "text": "Alternative methodology option"},
                    {"id": "d", "text": "Not applicable"}
                ],
                "correct_option_id": "a",
                "explanation": f"Source chunk (Page {chunk.page_number}) contains dense mathematical notation outside whitelist.",
                "difficulty": "hard",
                "needs_human_review": True,
                "review_reason": "Equation-dense excerpt detected (Greek letters / matrix algebra)",
                "source_excerpt_ref": f"Page {chunk.page_number}",
                "competency_code": competency_id or "OS-01"
            }
            result.flagged_for_review.append(flagged_item)
            continue

        raw_qs = _generate_mcqs_from_chunk(
            chunk_text=chunk.text,
            chunk_ref=f"Page {chunk.page_number}",
            competency_code=competency_id or "OS-01",
            num_questions=1,
            difficulty_mix="mix of easy, medium, and hard"
        )

        if not raw_qs:
            result.skipped_chunks += 1
            continue

        for q_obj in raw_qs:
            mcq = mcq_to_dict(q_obj)

            # 1. Numeric consistency
            ok, reason = validate_numeric_consistency(mcq, chunk.text)
            if not ok:
                result.rejected.append(RejectedQuestion(chunk.chunk_id, chunk.page_number, "numeric_consistency", reason, mcq.get("question_text")))
                continue

            # 2. Formula verification
            ok, reason = validate_formula_application(mcq, chunk.text)
            if not ok:
                result.rejected.append(RejectedQuestion(chunk.chunk_id, chunk.page_number, "formula_verification", reason, mcq.get("question_text")))
                continue

            # 3. Depth check
            needs_passage, reason = check_needs_passage(mcq)
            if not needs_passage:
                result.rejected.append(RejectedQuestion(chunk.chunk_id, chunk.page_number, "depth_check", reason, mcq.get("question_text")))
                continue

            result.accepted.append(mcq)
            if mcq.get("needs_human_review"):
                result.flagged_for_review.append(mcq)

    return result
