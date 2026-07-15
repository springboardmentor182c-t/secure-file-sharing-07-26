from typing import Optional
from pydantic import BaseModel

class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: Optional[bool] = False
    due_date: Optional[str] = None
    priority: Optional[str] = "medium"

class TodoCreate(TodoBase):
    pass

class TodoUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    due_date: Optional[str] = None
    priority: Optional[str] = None

class TodoResponse(TodoBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
        orm_mode = True
