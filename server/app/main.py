from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.routers import users, stats, system_health
from app.core.scheduler import start_scheduler

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Admin Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(stats.router)
app.include_router(system_health.router)

@app.on_event("startup")
def startup_event():
    start_scheduler()

@app.get("/")
def root():
    return {"message": "Admin Dashboard API running"}