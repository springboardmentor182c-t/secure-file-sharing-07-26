"""
Business logic for AI file summary generation:
- checks/creates FileSummary rows
- extracts text from the file
- calls the AI model
- saves the result back to the DB
"""

import os

import httpx
from sqlalchemy.orm import Session

from src.entities.file import File
from src.entities.file_summary import FileSummary
from src.ai_summary.text_extractor import extract_text

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY")
AI_MODEL = "claude-sonnet-5"
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

    async def process_summary(self, file_id, file: File):
        """
        Runs in the background (via FastAPI BackgroundTasks):
        extract text -> call AI -> save result.
        Any failure marks the row as 'failed' instead of raising,
        since this runs outside the request/response cycle.
        """
        row = self.get_summary(file_id)
        if row is None:
            return

        try:
            text = self._read_file_text(file)

            if not text.strip():
                raise ValueError("No extractable text found in file")

            summary_text = await self._call_ai(text)

            row.summary = summary_text
            row.status = "completed"
            row.model_used = AI_MODEL
            self.db.commit()

        except Exception:
            row.status = "failed"
            self.db.commit()

    # ---------- internals ----------

    def _read_file_text(self, file: File) -> str:
        """
        Resolves the correct path (encrypted vs plain) and returns extracted text.
        """
        if file.encrypted_path:
            # TODO: hook into your project's decryption service here.
            # Example (once you confirm the real service):
            #   from src.security.service import decrypt_file
            #   plain_path = decrypt_file(file.encrypted_path, file.id)
            #   return extract_text(plain_path)
            raise NotImplementedError(
                "Encrypted file summarization isn't wired up yet — "
                "needs the project's decryption service."
            )

        return extract_text(file.storage_path)

    async def _call_ai(self, text: str) -> str:
        truncated_text = text[:MAX_CHARS]

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": ANTHROPIC_API_KEY,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": AI_MODEL,
                    "max_tokens": 300,
                    "messages": [
                        {
                            "role": "user",
                            "content": (
                                "Summarize this document in 3-4 concise sentences:\n\n"
                                f"{truncated_text}"
                            ),
                        }
                    ],
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]