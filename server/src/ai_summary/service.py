"""
Business logic for AI file summary generation:
- checks/creates FileSummary rows
- extracts text from the file
- calls the AI model (Gemini)
- saves the result back to the DB
"""

import os

import httpx
from sqlalchemy.orm import Session

from src.entities.file_summary import FileSummary
from src.ai_summary.text_extractor import extract_text

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AI_MODEL = "gemini-2.0-flash"
MAX_CHARS = 15000  # keep requests small/cheap; adjust as needed


class FileSummaryService:
    def __init__(self, db: Session):
        self.db = db

    # ---------- reads ----------

    def get_summary(self, file_id) -> FileSummary | None:
        return (
            self.db.query(FileSummary)
            .filter(FileSummary.file_id == file_id)
            .first()
        )

    # ---------- writes ----------

    def start_generation(self, file_id) -> FileSummary:
        """
        Creates a new pending FileSummary row, or resets an existing
        failed/completed one back to pending for regeneration.
        """
        existing = self.get_summary(file_id)
        if existing:
            existing.status = "pending"
            existing.summary = ""
            self.db.commit()
            self.db.refresh(existing)
            return existing

        summary_row = FileSummary(file_id=file_id, summary="", status="pending")
        self.db.add(summary_row)
        self.db.commit()
        self.db.refresh(summary_row)
        return summary_row

    async def process_summary(self, file_id, storage_path: str, encrypted_path: str | None):
        """
        Runs in the background (via FastAPI BackgroundTasks):
        extract text -> call AI -> save result.
        Takes plain values (not the SQLAlchemy File object) because the
        original DB session is closed by the time this background task runs.
        """
        row = self.get_summary(file_id)
        if row is None:
            return

        try:
            text = self._read_file_text(storage_path, encrypted_path)

            if not text.strip():
                raise ValueError("No extractable text found in file")

            summary_text = await self._call_ai(text)

            row.summary = summary_text
            row.status = "completed"
            row.model_used = AI_MODEL
            self.db.commit()

        except Exception as e:
            print("❌ AI SUMMARY ERROR:", repr(e))  # TEMPORARY DEBUG LINE
            row.status = "failed"
            self.db.commit()

    # ---------- internals ----------

    def _read_file_text(self, storage_path: str, encrypted_path: str | None) -> str:
        """
        Resolves the correct path (encrypted vs plain) and returns extracted text.
        """
        if encrypted_path:
            raise NotImplementedError(
                "Encrypted file summarization isn't wired up yet — "
                "needs the project's decryption service."
            )
        return extract_text(storage_path)

    async def _call_ai(self, text: str) -> str:
        truncated_text = text[:MAX_CHARS]

        url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{AI_MODEL}:generateContent?key={GEMINI_API_KEY}"
        )

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                url,
                headers={"content-type": "application/json"},
                json={
                    "contents": [
                        {
                            "parts": [
                                {
                                    "text": (
                                        "Summarize this document in 3-4 concise sentences:\n\n"
                                        f"{truncated_text}"
                                    )
                                }
                            ]
                        }
                    ]
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]