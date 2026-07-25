from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import uuid

from src.database.core import get_db
from src.sharing.service import create_secure_link

# API Router configuration for the sharing module
router = APIRouter(prefix="/api/sharing", tags=["Secure Sharing"])

class GenerateLinkRequest(BaseModel):
    """
    Pydantic schema for validating the incoming JSON payload from the client frontend.
    """
    selectedFile: str
    accessLevel: str = "View Only"
    expiry: str = "7 days"
    maxDownloads: int = 10
    usePassword: bool = False
    password: Optional[str] = None
    allowedEmails: Optional[str] = None
    applyWatermark: bool = False
    notifyMe: bool = False
    oneTimeView: bool = False

@router.post("/generate")
def generate_link(request: GenerateLinkRequest, db: Session = Depends(get_db)):
    """
    API endpoint to generate a new secure sharing link.
    Validates input, invokes the service layer, and returns the generated URL.
    """
    try:
        # Mock UUIDs utilized for testing prior to complete authentication integration
        dummy_file_id = str(uuid.uuid4())
        dummy_user_id = str(uuid.uuid4())

        # Service layer invocation
        new_link = create_secure_link(
            db=db,
            request_data=request,
            file_id=dummy_file_id,
            user_id=dummy_user_id
        )

        return {
            "status": "success",
            "message": "Secure link generated successfully.",
            "data": {
                "share_token": new_link.share_token,
                "url": f"https://vault.sh/s/{new_link.share_token}",
                "expires_at": new_link.expires_at
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")