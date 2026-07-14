from pydantic import BaseModel
from typing import List

class SummaryStats(BaseModel):
    total_users: int
    active_users: int
    total_storage_gb: float
    files_this_month: int
    active_share_links: int

class UserStorage(BaseModel):
    user: str
    storage_gb: float