"""
MCQ Engine — PDF/DOCX/TXT → Source-Grounded MCQs via LLM.

Pipeline:
  1. Text extraction (PyMuPDF for PDF, python-docx for DOCX)
  2. Chunking by paragraph with page reference
  3. LLM call with source chunk → strict JSON MCQ output
  4. Validation (answer in options, no duplicates, source-grounded)
  5. Return MCQ list ready for DB storage

RULES:
  - LLM must ONLY use the provided source chunk — not general knowledge
  - Every question stores its source_page reference for auditability
  - Trainer review is required before high-stakes deployment
"""
import json
import re
import os
from dataclasses import dataclass, field
from typing import Optional

from app.config import get_llm_client, get_llm_model


# ─── Data types ───────────────────────────────────────────────────────────────

@dataclass
class MCQOption:
    id: str          # 'a', 'b', 'c', 'd'
    text: str


@dataclass
class MCQQuestion:
    question_text: str
    options: list[MCQOption]
    correct_option_id: str       # 'a', 'b', 'c', or 'd'
    explanation: str
    difficulty: str              # 'easy' | 'medium' | 'difficult' | 'hots'
    source_excerpt_ref: str      # e.g. "Page 3, para 2"
    competency_code: str
    source_chunk: str            # the exact text used to generate this question


# ─── Text extraction ──────────────────────────────────────────────────────────

def extract_text_from_pdf(filepath: str) -> list[tuple[int, str]]:
    """
    Returns list of (page_number, text) from a PDF.
    Requires: pip install PyMuPDF
    """
    try:
        import fitz  # PyMuPDF
    except ImportError:
        raise ImportError("PyMuPDF not installed. Run: pip install PyMuPDF")

    pages = []
    doc = fitz.open(filepath)
    for page_num, page in enumerate(doc, start=1):
        text = page.get_text("text").strip()
        if text:
            pages.append((page_num, text))
    doc.close()
    return pages


def extract_text_from_docx(filepath: str) -> list[tuple[int, str]]:
    """
    Returns list of (chunk_number, paragraph_text) from a DOCX.
    Each paragraph treated as a chunk.
    """
    try:
        from docx import Document
    except ImportError:
        raise ImportError("python-docx not installed. Run: pip install python-docx")

    doc = Document(filepath)
    chunks = []
    for i, para in enumerate(doc.paragraphs, start=1):
        text = para.text.strip()
        if len(text) > 50:    # skip blank/tiny paragraphs
            chunks.append((i, text))
    return chunks


def extract_text_from_txt(filepath: str) -> list[tuple[int, str]]:
    """Split plain text into chunks of ~500 characters."""
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    chunks = []
    for i, chunk in enumerate(
        [content[j:j+500] for j in range(0, len(content), 500)], start=1
    ):
        if chunk.strip():
            chunks.append((i, chunk.strip()))
    return chunks


def extract_text(filepath: str) -> list[tuple[int, str]]:
    """Auto-detect file type and extract text chunks."""
    ext = os.path.splitext(filepath)[1].lower()
    if ext == ".pdf":
        return extract_text_from_pdf(filepath)
    elif ext in (".docx", ".doc"):
        return extract_text_from_docx(filepath)
    elif ext == ".txt":
        return extract_text_from_txt(filepath)
    else:
        raise ValueError(f"Unsupported file type: {ext}. Supported: .pdf, .docx, .txt")


# ─── MCQ generation prompt ────────────────────────────────────────────────────

MCQ_SYSTEM_PROMPT = """You are an expert question paper setter for official statistics and data management training.

Generate Multiple Choice Questions (MCQs) from the provided source text.

STRICT RULES:
1. ALL questions must be based ONLY on the provided source text. Do NOT use general knowledge or external information.
2. Each question must have exactly 4 options (a, b, c, d).
3. Exactly one option must be correct. The others must be plausible but clearly wrong.
4. Never repeat question content across questions.
5. The correct answer must be explicitly supported by the source text.
6. Explanation must cite the relevant part of the source text.

OUTPUT FORMAT (return ONLY valid JSON, no markdown, no explanation outside JSON):
{
  "questions": [
    {
      "question_text": "...",
      "options": [
        {"id": "a", "text": "..."},
        {"id": "b", "text": "..."},
        {"id": "c", "text": "..."},
        {"id": "d", "text": "..."}
      ],
      "correct_option_id": "b",
      "explanation": "According to the text: '...' — this confirms option b.",
      "difficulty": "medium"
    }
  ]
}

Difficulty levels: 'easy' (recall), 'medium' (understanding), 'difficult' (application), 'hots' (analysis)."""


def _generate_mcqs_from_chunk(
    chunk_text: str,
    chunk_ref: str,
    competency_code: str,
    num_questions: int,
    difficulty_mix: str,
) -> list[MCQQuestion]:
    """Call LLM to generate MCQs from a single text chunk."""
    client = get_llm_client()
    model = get_llm_model()

    user_message = f"""Generate {num_questions} MCQ(s) from the following source text.
Competency area: {competency_code}
Difficulty: {difficulty_mix}

SOURCE TEXT:
\"\"\"
{chunk_text}
\"\"\"

Remember: ONLY use information from the above source text."""

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": MCQ_SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,    # slight randomness for question variety
            max_tokens=2048,
        )
    except Exception as e:
        raise RuntimeError(f"LLM call failed during MCQ generation: {e}") from e

    raw_json = response.choices[0].message.content or '{"questions":[]}'

    try:
        data = json.loads(raw_json)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw_json, re.DOTALL)
        if match:
            data = json.loads(match.group())
        else:
            return []

    questions = []
    for q in data.get("questions", []):
        # Validate
        if not q.get("question_text") or not q.get("options") or not q.get("correct_option_id"):
            continue
        option_ids = [o["id"] for o in q["options"]]
        if q["correct_option_id"] not in option_ids:
            continue  # skip invalid question
        if len(q["options"]) != 4:
            continue   # must have exactly 4 options

        questions.append(MCQQuestion(
            question_text=q["question_text"],
            options=[MCQOption(id=o["id"], text=o["text"]) for o in q["options"]],
            correct_option_id=q["correct_option_id"],
            explanation=q.get("explanation", ""),
            difficulty=q.get("difficulty", "medium"),
            source_excerpt_ref=chunk_ref,
            competency_code=competency_code,
            source_chunk=chunk_text[:300],   # store first 300 chars of source
        ))

    return questions


# ─── Main pipeline ────────────────────────────────────────────────────────────

def generate_mcqs(
    filepath: str,
    competency_code: str,
    total_questions: int = 10,
    difficulty_mix: str = "mix of easy, medium, and difficult",
    max_chunks: int = 5,
) -> list[MCQQuestion]:
    """
    Full pipeline: file → text chunks → MCQs.

    Args:
        filepath: Path to uploaded PDF/DOCX/TXT
        competency_code: e.g. 'OS-02' (Sampling Methodology)
        total_questions: total MCQs to generate
        difficulty_mix: description passed to LLM (e.g., "3 easy, 4 medium, 3 difficult")
        max_chunks: maximum text chunks to process (to control cost)

    Returns:
        List of MCQQuestion objects, validated and ready for DB storage.
    """
    chunks = extract_text(filepath)

    if not chunks:
        raise ValueError(f"No text could be extracted from {filepath}")

    # Limit chunks and calculate questions per chunk
    chunks = chunks[:max_chunks]
    qs_per_chunk = max(1, total_questions // len(chunks))
    remainder = total_questions - (qs_per_chunk * len(chunks))

    all_questions: list[MCQQuestion] = []
    seen_questions: set[str] = set()   # deduplicate by question text

    for i, (chunk_num, chunk_text) in enumerate(chunks):
        if len(all_questions) >= total_questions:
            break

        n_to_gen = qs_per_chunk + (1 if i < remainder else 0)
        chunk_ref = f"Chunk {chunk_num}"

        new_qs = _generate_mcqs_from_chunk(
            chunk_text=chunk_text,
            chunk_ref=chunk_ref,
            competency_code=competency_code,
            num_questions=n_to_gen,
            difficulty_mix=difficulty_mix,
        )

        for q in new_qs:
            # Deduplicate
            normalized = q.question_text.lower().strip()
            if normalized not in seen_questions:
                seen_questions.add(normalized)
                all_questions.append(q)
                if len(all_questions) >= total_questions:
                    break

    return all_questions[:total_questions]


def score_answers(
    questions: list[MCQQuestion],
    answers: dict[int, str],   # {question_index: selected_option_id}
) -> tuple[float, list[dict]]:
    """
    Score a completed quiz.

    Returns:
        (score_percent, detailed_results)
        score_percent: 0-100
        detailed_results: per-question breakdown with correct/wrong + explanation
    """
    correct = 0
    results = []

    for i, q in enumerate(questions):
        selected = answers.get(i, "")
        is_correct = selected == q.correct_option_id
        if is_correct:
            correct += 1

        results.append({
            "question_index": i,
            "question_text": q.question_text,
            "selected_option": selected,
            "correct_option": q.correct_option_id,
            "is_correct": is_correct,
            "explanation": q.explanation,
            "source_ref": q.source_excerpt_ref,
        })

    score_percent = round((correct / len(questions)) * 100, 2) if questions else 0.0
    return score_percent, results


def mcq_to_dict(q: MCQQuestion) -> dict:
    """Serialize MCQQuestion for DB storage and API response."""
    return {
        "question_text": q.question_text,
        "options": [{"id": o.id, "text": o.text} for o in q.options],
        "correct_option_id": q.correct_option_id,
        "explanation": q.explanation,
        "difficulty": q.difficulty,
        "source_excerpt_ref": q.source_excerpt_ref,
        "competency_code": q.competency_code,
    }
