from fastapi import APIRouter, UploadFile, File as FastAPIFile, Form, HTTPException
from fastapi.responses import FileResponse
import os
from datetime import datetime

from src.database.core import SessionLocal
from src.entities.file import File
from src.encryption.crypto import encrypt_data, decrypt_data

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# Upload file
@router.post("/")
async def upload_file(
    file: UploadFile = FastAPIFile(...),
    category: str = Form(""),
    tags: str = Form(""),
    is_encrypted: bool = Form(True),
    require_password: bool = Form(False),
    password: str = Form(""),
    virus_scanned: bool = Form(False),
    notify_on_access: bool = Form(False)
):
    print("Password received:", password)
    print("Category:", category)

    data = await file.read()

    if is_encrypted:
        nonce, encrypted_data = encrypt_data(data)

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename + ".enc"
        )

        with open(file_path, "wb") as buffer:
            buffer.write(nonce)
            buffer.write(encrypted_data)

        stored_filename = file.filename + ".enc"
        stored_size = len(encrypted_data)

    else:
        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.filename
        )

        with open(file_path, "wb") as buffer:
            buffer.write(data)

        stored_filename = file.filename
        stored_size = len(data)

    db = SessionLocal()

    try:
        new_file = File(
            file_name=stored_filename,
            file_size=stored_size,
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

    finally:
        db.close()

    return {
        "message": "File encrypted and uploaded successfully"
        if is_encrypted
        else "File uploaded successfully",
        "filename": stored_filename,
        "encrypted": is_encrypted,
        "size": stored_size
    }


# Decrypt uploaded encrypted file
@router.post("/decrypt")
async def decrypt_file(file: UploadFile = FastAPIFile(...)):
    data = await file.read()

    if len(data) < 12:
        raise HTTPException(
            status_code=400,
            detail="Invalid encrypted file"
        )

    nonce = data[:12]
    encrypted_data = data[12:]

    try:
        decrypted = decrypt_data(
            nonce,
            encrypted_data
        )
    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Failed to decrypt file"
        )

    return {
        "message": "File decrypted successfully",
        "content": decrypted.decode()
    }


# Get all files
@router.get("/files")
def get_files():

    db = SessionLocal()

    try:
        return db.query(File).all()
    finally:
        db.close()


# Delete file
@router.delete("/files/{file_id}")
def delete_file(file_id: int):

    db = SessionLocal()

    try:
        file = (
            db.query(File)
            .filter(File.id == file_id)
            .first()
        )

        if not file:
            return {"message": "File not found"}

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file.file_name
        )

        if os.path.exists(file_path):
            os.remove(file_path)

        db.delete(file)
        db.commit()

        return {
            "message": "File deleted successfully"
        }

    finally:
        db.close()


# Download file
@router.get("/files/download/{file_name}")
def download_file(
    file_name: str,
    password: str = ""
):

    db = SessionLocal()

    try:
        file = (
            db.query(File)
            .filter(File.file_name == file_name)
            .first()
        )

        if not file:
            raise HTTPException(
                status_code=404,
                detail="File not found"
            )

        if file.require_password and password != file.password:
            raise HTTPException(
                status_code=401,
                detail="Wrong password"
            )

        file_path = os.path.join(
            UPLOAD_FOLDER,
            file_name
        )

        if not os.path.exists(file_path):
            raise HTTPException(
                status_code=404,
                detail="Physical file not found"
            )

        return FileResponse(
            path=file_path,
            filename=file_name,
            media_type="application/octet-stream"
        )

    finally:
        db.close()