"""
Central place where adapter selection happens. This is the ONLY file that
should need a change when a real iGOT/NSSTA/SSO integration becomes available
— flip the environment variable, implement the corresponding adapter class,
done.

LLM config is also centralised here. Three providers are supported:
  - 'novita'  → Novita AI (OpenAI-compatible API, uses openai SDK with custom base_url)
  - 'openai'  → OpenAI directly
  - 'google'  → Google Gemini via google-generativeai SDK

To switch: change LLM_PROVIDER in .env. No code changes needed.
"""
import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()

from app.adapters.course_catalog.base import CourseCatalogProvider
from app.adapters.course_catalog.mock_adapter import MockCourseCatalogAdapter

# ─── Adapter selection ────────────────────────────────────────────────────────
MOCK_CATALOG_PATH = os.getenv("MOCK_CATALOG_PATH", "data/mock_course_catalog.json")
COURSE_CATALOG_PROVIDER = os.getenv("COURSE_CATALOG_PROVIDER", "mock")  # 'mock' | 'igot'
TRAINING_CALENDAR_PROVIDER = os.getenv("TRAINING_CALENDAR_PROVIDER", "mock")  # 'mock' | 'nssta'
AUTH_PROVIDER = os.getenv("AUTH_PROVIDER", "mock")  # 'mock' | 'parichay_sso'

# ─── LLM Configuration ───────────────────────────────────────────────────────
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "novita")  # 'novita' | 'openai' | 'google'

# Novita AI (recommended for this project — OpenAI-compatible, cheapest)
NOVITA_API_KEY     = os.getenv("NOVITA_API_KEY", "")
NOVITA_BASE_URL    = os.getenv("NOVITA_BASE_URL", "https://api.novita.ai/v3/openai")
NOVITA_MODEL       = os.getenv("NOVITA_MODEL", "deepseek/deepseek-v4-flash")
NOVITA_EMBED_MODEL = os.getenv("NOVITA_EMBEDDING_MODEL", "baai/bge-m3")

# OpenAI (fallback)
OPENAI_API_KEY     = os.getenv("OPENAI_API_KEY", "")
OPENAI_MODEL       = os.getenv("OPENAI_MODEL", "gpt-4o")
OPENAI_EMBED_MODEL = os.getenv("OPENAI_EMBEDDING_MODEL", "text-embedding-3-small")

# Google Gemini (fallback)
GOOGLE_API_KEY  = os.getenv("GOOGLE_API_KEY", "")
GOOGLE_MODEL    = os.getenv("GOOGLE_MODEL", "gemini-1.5-flash")

# Auth
JWT_SECRET          = os.getenv("JWT_SECRET", "dev_secret_change_in_prod")
JWT_ALGORITHM       = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES  = int(os.getenv("JWT_EXPIRE_MINUTES", "60"))

# Upload
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "data/uploads")


# ─── LLM client factory ───────────────────────────────────────────────────────

def get_llm_client():
    """
    Returns an OpenAI-compatible client regardless of provider.

    Novita AI uses the OpenAI Python SDK with a custom base_url — identical
    interface, zero extra code. Just swap the base_url and api_key.

    Usage in domain code:
        from app.config import get_llm_client, LLM_MODEL, LLM_EMBED_MODEL
        client = get_llm_client()
        response = client.chat.completions.create(model=LLM_MODEL, ...)
    """
    from openai import OpenAI

    if LLM_PROVIDER == "novita":
        if not NOVITA_API_KEY:
            raise EnvironmentError(
                "NOVITA_API_KEY not set. Add it to your .env file.\n"
                "Get your key at: https://novita.ai → Account → API Keys"
            )
        return OpenAI(api_key=NOVITA_API_KEY, base_url=NOVITA_BASE_URL)

    elif LLM_PROVIDER == "openai":
        if not OPENAI_API_KEY:
            raise EnvironmentError("OPENAI_API_KEY not set in .env")
        return OpenAI(api_key=OPENAI_API_KEY)

    elif LLM_PROVIDER == "google":
        raise NotImplementedError(
            "Google Gemini uses a different SDK (google-generativeai). "
            "Switch to LLM_PROVIDER=novita or LLM_PROVIDER=openai for now."
        )

    raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER!r}. Use 'novita', 'openai', or 'google'.")


FAST_LLM_MODEL     = os.getenv("FAST_LLM_MODEL", "meta-llama/llama-3.3-70b-instruct")

def get_llm_model() -> str:
    """Returns the correct model name for the current provider."""
    if LLM_PROVIDER == "novita":
        return NOVITA_MODEL
    if LLM_PROVIDER == "openai":
        return OPENAI_MODEL
    raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")


def get_fast_llm_model() -> str:
    """Returns high-precision, high-speed model for accurate CV profile extraction."""
    if LLM_PROVIDER == "novita":
        return FAST_LLM_MODEL
    if LLM_PROVIDER == "openai":
        return "gpt-4o-mini"
    return get_llm_model()


def execute_llm_with_fallback(
    messages: list[dict],
    primary_model: str = None,
    fallback_model: str = None,
    temperature: float = 0.0,
    max_tokens: int = 1536,
) -> str:
    """
    Executes an LLM chat completion with an automatic fallback mechanism.
    If the primary model call fails (e.g. server overload 503/429/timeout)
    or returns empty content, it automatically retries using the fallback model.
    """
    client = get_llm_client()
    if not primary_model:
        primary_model = get_fast_llm_model()
    if not fallback_model:
        fallback_model = NOVITA_MODEL if LLM_PROVIDER == "novita" else OPENAI_MODEL

    try:
        response = client.chat.completions.create(
            model=primary_model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        content = (response.choices[0].message.content or "").strip()
        if content:
            return content
        print(f"[LLM WARNING] Primary model '{primary_model}' returned empty content. Retrying with fallback...")
    except Exception as err:
        print(f"[LLM ERROR] Primary model '{primary_model}' failed: {err}. Retrying with fallback model '{fallback_model}'...")

    # Retry with fallback model if primary model failed or returned empty content
    if primary_model != fallback_model:
        try:
            response = client.chat.completions.create(
                model=fallback_model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
            )
            content = (response.choices[0].message.content or "").strip()
            if content:
                return content
        except Exception as fallback_err:
            print(f"[LLM ERROR] Fallback model '{fallback_model}' also failed: {fallback_err}")
            raise RuntimeError(f"Primary model '{primary_model}' and fallback model '{fallback_model}' both failed.") from fallback_err

    return ""


def get_embedding_model() -> str:
    """Returns the embedding model name for the current provider."""
    if LLM_PROVIDER == "novita":
        return NOVITA_EMBED_MODEL
    if LLM_PROVIDER == "openai":
        return OPENAI_EMBED_MODEL
    raise ValueError(f"Unknown LLM_PROVIDER: {LLM_PROVIDER}")


# ─── Course catalog adapter ───────────────────────────────────────────────────

@lru_cache
def get_course_catalog_provider() -> CourseCatalogProvider:
    if COURSE_CATALOG_PROVIDER == "mock":
        return MockCourseCatalogAdapter(MOCK_CATALOG_PATH)
    if COURSE_CATALOG_PROVIDER == "igot":
        raise NotImplementedError(
            "IGOTCourseCatalogAdapter not yet implemented — this is the one "
            "class that needs writing when real API access is granted."
        )
    raise ValueError(f"Unknown COURSE_CATALOG_PROVIDER: {COURSE_CATALOG_PROVIDER}")

