from fastapi import FastAPI
from src.api import api_router

app = FastAPI(
    title="Secure File Sharing Platform",
    version="1.0.0"
)

app.include_router(api_router)


@app.get("/")
def root():
    return {"message": "Secure File Sharing Platform API is running"}