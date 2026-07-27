from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.database.core import get_db
from src.auth.dependencies import get_current_user
from src.entities.user import User
from src.encryption import models, service

router = APIRouter()


@router.get("/dashboard", response_model=models.DashboardResponse)
def dashboard(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Security posture for the encryption dashboard (real coverage + representative checks)."""
    return service.build_dashboard(db, current_user)


@router.post("/encrypt", response_model=models.EncryptResponse)
def encrypt(body: models.EncryptRequest, current_user: User = Depends(get_current_user)):
    """Encrypt a piece of text with the server's AES key (Fernet)."""
    return models.EncryptResponse(ciphertext=service.encrypt_text(body.plaintext))


@router.post("/decrypt", response_model=models.DecryptResponse)
def decrypt(body: models.DecryptRequest, current_user: User = Depends(get_current_user)):
    """Decrypt ciphertext produced by /encrypt."""
    return models.DecryptResponse(plaintext=service.decrypt_text(body.ciphertext))
