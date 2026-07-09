from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api import api_router

app = FastAPI(
    title="TrustShare API",
    version="1.0.0",
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "TrustShare API Running"
    }