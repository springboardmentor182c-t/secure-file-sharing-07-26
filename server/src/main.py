from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.database.core import engine, Base
from src.sharing import model 

# Database tables initialization
Base.metadata.create_all(bind=engine)

# FastAPI application instance
app = FastAPI(title="TrustShare API", version="1.0.0")

# CORS Configuration for frontend integration
# Allows requests from the local React development server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Router registrations
from src.sharing.controller import router as sharing_router
app.include_router(sharing_router)