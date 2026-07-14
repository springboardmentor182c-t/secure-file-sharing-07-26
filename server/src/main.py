from fastapi import FastAPI
from src.sharing.controller import router as sharing_router # Apna naya import!

app = FastAPI(title="Secure File Sharing API")

app.include_router(sharing_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Secure File Sharing API"}