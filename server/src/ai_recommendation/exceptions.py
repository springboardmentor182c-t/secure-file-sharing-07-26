"""Exceptions local to the AI recommendation module.

These are intentionally NOT added to `src/exceptions.py` - the feature must
never surface raw errors to the user, so every path in `service.py` catches
these internally and degrades to the next method in the chain instead of
letting them bubble up as HTTP errors.
"""


class AIRecommendationError(Exception):
    """Base class for anything that should trigger a fallback to the next
    method in the Grok -> Embeddings -> Fallback chain."""


class GrokUnavailableError(AIRecommendationError):
    """Grok request failed, timed out, or returned something unusable."""


class EmbeddingUnavailableError(AIRecommendationError):
    """The local embedding model/library isn't installed or failed to run."""


class InvalidRecommendationError(AIRecommendationError):
    """A candidate recommendation didn't pass validation against the user's
    real, owned folder set."""
