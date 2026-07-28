from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from src.database.core import get_db
from src.recent.models import RecentFileResponse
from src.recent import service

router = APIRouter(
    prefix="/api/files",
    tags=["Recent"],
)


@router.get("/recent", response_model=List[RecentFileResponse])
def read_recent_files(
    db: Session = Depends(get_db),
):
    return service.get_recent_files(db=db)