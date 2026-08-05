from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.trash.models import TrashItemResponse
from src.trash import service

router = APIRouter(prefix="/api/trash", tags=["Trash"])


@router.get("", response_model=List[TrashItemResponse])
def read_trash_items(db: Session = Depends(get_db)):
    return service.get_trash_items(db=db)
