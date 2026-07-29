from fastapi import APIRouter, UploadFile, File as FastAPIFile, Form
import shutil
import os
from datetime import datetime
from fastapi import HTTPException

from src.database.core import SessionLocal
from src.entities.file import File
from fastapi.responses import FileResponse
router = APIRouter()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    category: str = Form(...),
    tags: str = Form(""),
    is_encrypted: bool = Form(True),
    require_password: bool = Form(False),
    password: str = Form(""),
    virus_scanned: bool = Form(False),
    notify_on_access: bool = Form(False)

):
    print("Password received:", password)

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    print("Category:", category)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    db = SessionLocal()

    new_file = File(
    file_name=file.filename,
    file_size=os.path.getsize(file_path),
    file_type=file.content_type,
    uploaded_by="Admin",
    uploaded_at=str(datetime.now()),
    category=category,
    tags=tags,
    is_encrypted=is_encrypted,
    require_password=require_password,
    password=password,
    virus_scanned=virus_scanned,
    notify_on_access=notify_on_access,
    is_safe=True,
)

    db.add(new_file)
    db.commit()
    db.close()

    return {
        "message": "File uploaded successfully",
        "filename": file.filename
    }
@router.get("/files")
def get_files():

    db = SessionLocal()

    files = db.query(File).all()

    db.close()

    return files
@router.delete("/files/{file_id}")
def delete_file(file_id: int):

    db = SessionLocal()

    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        db.close()
        return {"message": "File not found"}

    file_path = os.path.join(UPLOAD_FOLDER, file.file_name)

    if os.path.exists(file_path):
        os.remove(file_path)

    db.delete(file)
    db.commit()
    db.close()

    return {"message": "File deleted successfully"}
   

@router.get("/files/download/{file_name}")
def download_file(file_name: str, password: str = ""):

    db = SessionLocal()

    file = db.query(File).filter(File.file_name == file_name).first()

    if not file:
        db.close()
        raise HTTPException(status_code=404, detail="File not found")

    if file.require_password:
        if password != file.password:
            db.close()
            raise HTTPException(status_code=401, detail="Wrong password")

    db.close()

    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/octet-stream"
    )

    file_path = os.path.join(UPLOAD_FOLDER, file_name)

    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type="application/octet-stream"
    )