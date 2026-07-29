from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class ReportCreateSchema(BaseModel):
    name: str
    type: str
    schedule: str
    recipients: int

class ReportResponseSchema(BaseModel):
    id: str
    report_type: str
    report_date: date
    created_at: datetime

    class Config:
        from_attributes = True