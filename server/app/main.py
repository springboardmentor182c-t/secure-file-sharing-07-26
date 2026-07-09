from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.config import settings
from app.routers import auth, mfa, password_reset, oauth

# NOTE: For production, use Alembic migrations instead of create_all().
# This is convenient for local development / first run only.
Base.metadata.create_all(bind=engine)

app = FastAPI(title="TrustShare Auth API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,  # required so the browser sends/receives the httpOnly refresh cookie
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(mfa.router)
app.include_router(password_reset.router)
app.include_router(oauth.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
