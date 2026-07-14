from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from src.database.core import get_db 
from src.sharing.service import create_secure_link

# API Router setup
router = APIRouter(prefix="/api/sharing", tags=["Secure Sharing"])

# Frontend form data structure
class GenerateLinkRequest(BaseModel):
    file_id: str
    user_id: str
    share_type: str = "public"
    expiry_days: int = 7
    password: Optional[str] = None
    max_dl: int = 10

@router.post("/generate")
def generate_link(request: GenerateLinkRequest, db: Session = Depends(get_db)):
    try:
        # Apne service module se function call karna
        new_link = create_secure_link(
            db=db,
            file_id=request.file_id,
            user_id=request.user_id,
            share_type=request.share_type,
            expiry_days=request.expiry_days,
            password=request.password,
            max_dl=request.max_dl
        )
        
        
        return {
            "status": "success",
            "message": "Secure link generated successfully",
            "share_url": f"https://vault.sh/s/{new_link.share_token}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))