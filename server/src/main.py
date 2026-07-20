from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api import register_routes

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_routes(app)


@app.get("/")
def root():
    return {"message": "Backend is running successfully!"}