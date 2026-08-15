"""
Business logic for AI file summary generation:
- checks/creates FileSummary rows
- pulls the real file's encrypted bytes off the storage backend and decrypts them
- extracts text
- calls the AI model (Gemini)
- saves the result back to the DB
"""

import os
import uuid
import logging

import httpx
from sqlalchemy.orm import Session

from src.entities.file import File
from src.entities.file_summary import FileSummary
from src.ai_summary.text_extractor import extract_text, is_supported
from src.files.constants import EncryptionStatus
from src.files.encryption import decrypt_bytes
from src.files.storage import get_storage_backend

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
AI_MODEL = "gemini-flash-latest"
MAX_CHARS = 15000  # keep requests small/cheap; adjust as needed
logger = logging.getLogger(__name__)

class FileSummaryService:
    def __init__(self, db: Session):
        self.db = db

    # ---------- reads ----------

    def get_summary(self, file_id:int) -> FileSummary | None:
        return (
            self.db.query(FileSummary)
            .filter(FileSummary.file_id == file_id)
            .first()
        )

    # ---------- writes ----------

    def start_generation(self, file_id: int) -> FileSummary:
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

    async def process_summary(self, file_id: int):
        """
        Runs in the background (via FastAPI BackgroundTasks): fetch the
        file row fresh (the request's DB session is closed by the time
        this runs), read + decrypt its bytes, extract text, call the AI,
        save the result.

        Takes only `file_id` (not the File object or its paths) because
        this needs its own DB session anyway to persist the result, and
        re-reading the file row here avoids passing around a detached
        SQLAlchemy instance across the background-task boundary.
        """
        from src.database.core import SessionLocal

        db = SessionLocal()
        try:
            file_obj = db.get(File, file_id)
            row = (
                db.query(FileSummary)
                .filter(FileSummary.file_id == file_id)
                .first()
            )
            if row is None or file_obj is None:
                return

            try:
                if not is_supported(file_obj.extension):
                    raise ValueError(f"'.{file_obj.extension}' files can't be summarized yet")

                raw = get_storage_backend().read(file_obj.file_path)
                plaintext_bytes = (
                    decrypt_bytes(raw)
                    if file_obj.encryption_status == EncryptionStatus.ENCRYPTED.value
                    else raw
                )

                text = extract_text(plaintext_bytes, file_obj.extension)
                if not text.strip():
                    raise ValueError("No extractable text found in file")

                summary_text = await self._call_ai(text)

                row.summary = summary_text
                row.status = "completed"
                row.model_used = AI_MODEL
                db.commit()

            except Exception as e:
                logger.exception(f"Summary generation failed for file_id={file_id}")
                row.status = "failed"
                db.commit()
        finally:
            db.close()

    # ---------- internals ----------

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