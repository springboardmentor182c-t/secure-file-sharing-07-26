import os

APP_NAME = "TrustShare API"
allowed_origins = os.getenv("ALLOWED_ORIGINS")
if allowed_origins is None:
    allowed_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in allowed_origins.split(",") if origin.strip()]