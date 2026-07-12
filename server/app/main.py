from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.dashboard.routes import router as dashboard_router
from app.api.v1.activity_monitor.routes import router as activity_monitor_router
from app.api.v1.dashboard.service import seed_dashboard_data
from app.core.config import get_settings
from app.database.session import SessionLocal, init_db


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    if settings.dashboard_seed_on_startup:
        with SessionLocal() as db:
            seed_dashboard_data(db)
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(dashboard_router, prefix=settings.api_v1_prefix)
app.include_router(activity_monitor_router, prefix=settings.api_v1_prefix)

@app.get("/health")
def health_check():
    return {"status": "ok", "service": settings.app_name}
