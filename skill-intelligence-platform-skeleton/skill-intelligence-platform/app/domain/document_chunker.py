"""
app/domain/document_chunker.py

Structure-aware chunking for complex MoSPI documents:
- Paragraphs are kept whole wherever possible, so a sentence (and any
  number inside it) is never sliced in half by an arbitrary cutoff.
- A paragraph is only split when it alone exceeds max_chunk_chars, and
  even then, only on sentence boundaries -- never mid-sentence.
- Table-like content is detected heuristically and flagged (is_table_like).
- Equation-dense content (matrix algebra, Bayesian model specifications,
  Gibbs-sampler full conditionals) is ALSO detected heuristically and
  flagged (is_equation_dense).
"""
import re
from dataclasses import dataclass
from typing import Optional

_SENTENCE_SPLIT = re.compile(r'(?<=[.!?])\s+')
_GREEK = re.compile(r'[\u0370-\u03FF\u1F00-\u1FFF]')
_MATH_ALNUM = re.compile(r'[\U0001D400-\U0001D7FF]')  # bold/italic math letters for vector/matrix notation
_MATH_OPS = re.compile(r'[∼∝∑∫√≤≥×÷∈⋃∂]')


@dataclass
class Chunk:
    chunk_id: str
    text: str
    page_number: Optional[int]
    char_start: int
    char_end: int
    is_table_like: bool = False
    is_equation_dense: bool = False


def _split_into_paragraphs(page_text: str) -> list[str]:
    paras = re.split(r'\n\s*\n', page_text.strip())
    paras = [p.strip() for p in paras if p.strip()]
    if len(paras) <= 1 and '\n' in page_text:
        paras = [p.strip() for p in page_text.split('\n') if p.strip()]
    return paras


def _looks_like_table(text: str) -> bool:
    """Flags text where most lines are digit-heavy AND column-spaced."""
    lines = [l for l in text.split('\n') if l.strip()]
    if not lines:
        return False
    digit_heavy = sum(1 for l in lines if len(re.findall(r'\d', l)) > len(l) * 0.25)
    multi_space = sum(1 for l in lines if re.search(r'\s{2,}|\t', l))
    return (digit_heavy / len(lines)) > 0.5 and (multi_space / len(lines)) > 0.4


def _looks_like_dense_math(text: str) -> bool:
    """Detects unicode Greek letters, math-alphanumeric bold/italic symbols, and math operators."""
    non_ws = re.sub(r'\s', '', text)
    if not non_ws:
        return False
    greek_count = len(_GREEK.findall(text))
    math_alnum_count = len(_MATH_ALNUM.findall(text))
    op_count = len(_MATH_OPS.findall(text))
    symbol_density = (greek_count + math_alnum_count + op_count) / len(non_ws)
    eq_density = text.count('=') / max(len(non_ws), 1) * 100
    return symbol_density > 0.03 or eq_density > 1.5


def _split_long_paragraph(para: str, max_chars: int) -> list[str]:
    if len(para) <= max_chars:
        return [para]
    sentences = _SENTENCE_SPLIT.split(para)
    pieces, current = [], ""
    for sent in sentences:
        candidate = f"{current} {sent}".strip() if current else sent
        if len(candidate) <= max_chars:
            current = candidate
        else:
            if current:
                pieces.append(current)
            current = sent
    if current:
        pieces.append(current)
    return pieces


def chunk_document(pages: list[str], max_chunk_chars: int = 1200) -> list[Chunk]:
    chunks: list[Chunk] = []
    counter = 0
    offset = 0

    def flush(buf, start, is_table, page_num):
        nonlocal counter
        if not buf.strip():
            return
        counter += 1
        is_math = _looks_like_dense_math(buf)
        chunks.append(Chunk(
            chunk_id=f"chunk-{counter:04d}",
            text=buf.strip(),
            page_number=page_num,
            char_start=start,
            char_end=start + len(buf),
            is_table_like=is_table,
            is_equation_dense=is_math
        ))

    for page_num, page_text in enumerate(pages, start=1):
        page_text = page_text.strip()
        if not page_text:
            continue

        buffer, buffer_start = "", offset
        for para in _split_into_paragraphs(page_text):
            if _looks_like_table(para):
                flush(buffer, buffer_start, False, page_num)
                buffer = ""
                for piece in _split_long_paragraph(para, max_chunk_chars):
                    flush(piece, offset, True, page_num)
                    offset += len(piece) + 2
                buffer_start = offset
                continue

            candidate = f"{buffer} {para}".strip() if buffer else para
            if len(candidate) <= max_chunk_chars:
                buffer = candidate
            else:
                flush(buffer, buffer_start, False, page_num)
                pieces = _split_long_paragraph(para, max_chunk_chars)
                for piece in pieces[:-1]:
                    flush(piece, offset, False, page_num)
                buffer = pieces[-1] if pieces else ""
                buffer_start = offset
            offset += len(para) + 2

        flush(buffer, buffer_start, False, page_num)

    return chunks
