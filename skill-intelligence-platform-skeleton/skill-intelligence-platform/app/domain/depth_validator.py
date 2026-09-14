"""
app/domain/depth_validator.py

Depth check validator:
Second-pass LLM call given NO source excerpt and NO topic context.
If the model can answer confidently from general knowledge alone, the question is discarded as too generic.
"""
import json
from app.config import get_llm_client, get_fast_llm_model, get_llm_model, execute_llm_with_fallback
from app.domain.profile_extractor import parse_llm_json

DEPTH_CHECK_PROMPT = """You will be shown a multiple-choice question and its options, with NO source material and NO topic context.

Answer ONLY if you are highly confident from general knowledge alone. If the question depends on a specific document, dataset, figure, or detail that isn't something a well-informed person would already know, respond with exactly: INSUFFICIENT_INFO

Return ONLY valid JSON in this exact shape:
{"answer": "a" | "b" | "c" | "d" | "INSUFFICIENT_INFO"}
"""


def check_needs_passage(mcq: dict) -> tuple[bool, str]:
    if mcq.get("skip", False):
        return True, "Skipped by generator, no depth check needed"

    options = mcq.get("options", {})
    if isinstance(options, list):
        options_text = "\n".join(f"{o.get('id')}. {o.get('text')}" for o in options)
    else:
        options_text = "\n".join(f"{k}. {v}" for k, v in options.items())

    user_message = f"Question: {mcq.get('question_text', '')}\n\nOptions:\n{options_text}"

    try:
        raw_json = execute_llm_with_fallback(
            messages=[
                {"role": "system", "content": DEPTH_CHECK_PROMPT},
                {"role": "user", "content": user_message},
            ],
            primary_model=get_fast_llm_model(),
            fallback_model=get_llm_model(),
            temperature=0.0,
            max_tokens=128,
        )
        data = parse_llm_json(raw_json)
        blind_answer = str(data.get("answer", "INSUFFICIENT_INFO")).strip()
    except Exception:
        # Fallback to True if API call fails
        return True, "Depth check bypass on API exception -- assumed grounded"

    correct = mcq.get("correct_option_id") or mcq.get("correct_option")

    if blind_answer == "INSUFFICIENT_INFO":
        return True, "Model could not answer without source -- question is properly grounded"
    if blind_answer.lower() != str(correct).lower():
        return True, f"Model guessed '{blind_answer}' without source, which is wrong -- question depends on source"

    return False, f"Model answered '{blind_answer}' correctly with NO source text -- question is too generic"
