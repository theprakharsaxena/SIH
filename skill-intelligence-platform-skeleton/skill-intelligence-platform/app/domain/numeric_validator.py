"""
app/domain/numeric_validator.py

Numeric-consistency validator:
- Ensures question stems, explanations, and recall correct answers contain ONLY numbers explicitly present in source text.
- Distractors are exempt since inventing plausible wrong numbers is the job of a distractor.
- For computed questions, verifies that computation INPUTS are grounded verbatim in source.
"""
import re

_NUMBER_PATTERN = re.compile(r'-?\d[\d,]*\.?\d*%?')


def extract_numbers(text: str) -> set[str]:
    """Pulls numeric tokens out of a string, normalized with commas removed."""
    raw = _NUMBER_PATTERN.findall(text)
    return {tok.replace(',', '') for tok in raw}


def validate_numeric_consistency(mcq: dict, chunk_text: str) -> tuple[bool, str]:
    if mcq.get("skip", False):
        return True, "Skipped by model, no validation needed"

    source_numbers = extract_numbers(chunk_text)
    correct_key = mcq.get("correct_option") or mcq.get("correct_option_id")
    options = mcq.get("options", {})
    if isinstance(options, list):
        options = {opt.get("id"): opt.get("text") for opt in options if isinstance(opt, dict)}
    
    is_computed = "computation" in mcq

    fields_to_check = {
        "question_text": mcq.get("question_text", ""),
        "explanation": mcq.get("explanation", ""),
    }
    if not is_computed and correct_key and correct_key in options:
        fields_to_check["correct_option"] = options[correct_key]
    if is_computed:
        comp = mcq.get("computation", {})
        fields_to_check["computation_inputs"] = str(comp.get("expression", "")) or str(comp.get("args", ""))

    invented = {}
    for field_name, field_text in fields_to_check.items():
        not_found = {n for n in extract_numbers(str(field_text)) if n not in source_numbers}
        if not_found:
            invented[field_name] = not_found

    if invented:
        return False, f"Numbers not grounded in source chunk: {invented}"

    return True, ("Numbers grounded in source" if not is_computed
                   else "Computation inputs grounded in source (result verified separately)")
