from pydantic import BaseModel

class FileCreate(BaseModel):
    file_name: str
    file_size: int
    file_type: str
    uploaded_by: str
    uploaded_at: str