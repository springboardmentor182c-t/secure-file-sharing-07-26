"""
AI Smart Folder Recommendation module.

Self-contained, additive feature: given an in-flight upload (not yet saved),
recommend one of the authenticated user's *existing* folders as the best
destination. Nothing in here is imported by, or changes the behaviour of,
any other module - the only integration points are:

  * `src/api.py`            -> registers `router` from this package
  * `.env` / `.env.example` -> new, independent env vars (all optional)
  * `requirements.txt`      -> a few additive dependencies

See `service.py` for the Grok -> Embeddings -> Fallback flow.
"""
from src.ai_recommendation.controller import router  # noqa: F401
