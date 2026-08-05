"""
Re-exports the shared auth dependency from `src.dependencies` so existing
`from src.shared_links.dependencies import get_current_user_id` imports
elsewhere in this module keep working unchanged. The actual implementation
now lives in one place (`src/dependencies.py`) so the Files module (and any
future module) doesn't need its own copy of this logic.
"""
from src.dependencies import get_current_user_id  # noqa: F401
