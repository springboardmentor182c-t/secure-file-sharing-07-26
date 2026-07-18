from pydantic import BaseModel
from typing import Optional


class EncryptRequest(BaseModel):
    plaintext: str


class EncryptResponse(BaseModel):
    ciphertext: str
    algorithm: str = "AES-128-CBC (Fernet)"


class DecryptRequest(BaseModel):
    ciphertext: str


class DecryptResponse(BaseModel):
    plaintext: str


class FeatureItem(BaseModel):
    title: str
    subtitle: str
    status: str          # Active | Scheduled
    tone: str            # emerald | amber


class AuditItem(BaseModel):
    title: str
    subtitle: str
    status: str          # Pass | Warning


class DashboardStats(BaseModel):
    files_encrypted: int
    files_encrypted_pct: str
    key_age_days: int
    key_age_note: str
    failed_decryptions: int
    failed_note: str


class DashboardResponse(BaseModel):
    security_score: int
    score_label: str
    compliance: str
    features: list[FeatureItem]
    workflow: list[str]
    audit: list[AuditItem]
    stats: DashboardStats
