from pydantic import BaseModel

class UserCreate(BaseModel):
    name: str
    email: str
    role: str
    storage_used: str
    last_login: str
    status: str