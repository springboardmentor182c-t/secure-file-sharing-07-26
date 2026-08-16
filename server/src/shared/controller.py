from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.shared.models import SharedLinkResponse
from src.shared import service

router = APIRouter(prefix="/api/shared", tags=["Shared"])


@router.get("", response_model=List[SharedLinkResponse])
def read_shared_links(db: Session = Depends(get_db)):
    return service.get_shared_links(db=db)
