from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.core import engine, Base, SessionLocal
from src.security.controller import router as security_router
from src.users.api import router as users_router
from src.security.service import seed_db

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed initial data
db = SessionLocal()
try:
    seed_db(db)
finally:
    db.close()

app = FastAPI(title="TrustShare Security Dashboard API", version="1.0.0")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(security_router)
app.include_router(users_router)

@app.get("/")
def read_root():
    return {"status": "healthy", "service": "TrustShare Security Control Center API"}
