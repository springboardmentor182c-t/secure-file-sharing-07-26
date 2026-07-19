"""
Application entrypoint.

Run with:
    uvicorn src.main:app --reload
"""
from dotenv import load_dotenv
load_dotenv()
import logging
import os
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api import register_routes
from .core import APP_NAME, ALLOWED_ORIGINS
from .database.core import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title=APP_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)


@app.get("/")
def root():
    return {"message": f"{APP_NAME} is running"}
