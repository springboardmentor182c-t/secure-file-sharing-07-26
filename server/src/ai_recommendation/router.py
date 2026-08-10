"""APIRouter instance for the AI recommendation module. Endpoint handlers
live in controller.py; kept separate so the router can be imported without
pulling in FastAPI route bodies, matching this module's requested layout."""
from fastapi import APIRouter

router = APIRouter(prefix="/api/ai", tags=["AI Recommendation"])
