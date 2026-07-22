from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.auth.controller import router as auth_router

app = FastAPI(
    title="TrustShare API",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Authentication APIs
app.include_router(auth_router)


@app.get("/")
def root():
    return {
        "message": "TrustShare Backend Running Successfully"
    }