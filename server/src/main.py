from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from src.api import api_router

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL")
FRONTEND_URL_ALT = os.getenv("FRONTEND_URL_ALT")

app = FastAPI(
    title="Secure File Sharing Platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL,
        FRONTEND_URL_ALT,
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/")
def root():
    return {
        "message": "Secure File Sharing Platform API is running"
    }