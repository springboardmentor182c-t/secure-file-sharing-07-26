from pydantic import BaseModel


class Notification(BaseModel):
    id: int
    title: str
    message: str
    time: str
    type: str
    icon: str
    color: str