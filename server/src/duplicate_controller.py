import os
import uuid
from typing import Optional
from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from src.database.core import get_db
from src.entities.file import File as FileModel
from src.entities.duplicate_log import DuplicateLog
from src.duplicate_detector import (
    calculate_sha256,
    get_file_category,
    calculate_text_similarity,
    calculate_image_ahash,
    calculate_image_similarity,
)

router = APIRouter(tags=["AI Duplicate Detection Engine"])

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")

def format_file_row(file_obj: FileModel) -> dict:
    return {
        "id": str(file_obj.id),
        "filename": file_obj.original_filename,
        "file_size": file_obj.size,
        "mime_type": file_obj.mime_type,
        "sha256_hash": file_obj.checksum,
        "stored_name": file_obj.stored_filename,
        "category": file_obj.category,
        "upload_date": str(file_obj.created_at) if file_obj.created_at else ""
    }

def format_log_row(log_obj: DuplicateLog) -> dict:
    return {
        "id": str(log_obj.id),
        "filename": log_obj.filename,
        "file_size": log_obj.file_size,
        "sha256_hash": log_obj.sha256_hash,
        "duplicate_type": log_obj.duplicate_type,
        "similarity_score": float(log_obj.similarity_score),
        "target_file_id": log_obj.target_file_id,
        "target_file_name": log_obj.target_file_name,
        "timestamp": str(log_obj.timestamp) if log_obj.timestamp else ""
    }

@router.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    bypass_near_duplicate: bool = Form(False),
    db: Session = Depends(get_db)
):
    os.makedirs(STORAGE_DIR, exist_ok=True)
    content = await file.read()
    file_size = len(content)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload an empty file.")
        
    sha256_hash = calculate_sha256(content)
    
    # 1. Exact Duplicate Check (SHA-256)
    exact_match = db.query(FileModel).filter(
        FileModel.checksum == sha256_hash,
        FileModel.is_deleted.is_(False)
    ).first()
    
    if exact_match:
        dup_log = DuplicateLog(
            filename=file.filename,
            file_size=file_size,
            sha256_hash=sha256_hash,
            duplicate_type="exact",
            similarity_score=1.0,
            target_file_id=str(exact_match.id),
            target_file_name=exact_match.original_filename
        )
        db.add(dup_log)
        db.commit()
        return {
            "status": "duplicate",
            "duplicate_type": "exact",
            "similarity": 1.0,
            "message": f"Exact duplicate detected. This content already exists as '{exact_match.original_filename}'.",
            "existing_file": format_file_row(exact_match)
        }
        
    category = get_file_category(file.filename, file.content_type or "")
    
    # 2. AI Near-Duplicate Check
    if not bypass_near_duplicate:
        if category == "text":
            try:
                decoded_content = content.decode("utf-8", errors="ignore")
                existing_text_files = db.query(FileModel).filter(
                    FileModel.category.ilike("text"),
                    FileModel.is_deleted.is_(False)
                ).all()
                
                existing_files_data = []
                for f_meta in existing_text_files:
                    f_path = os.path.join(STORAGE_DIR, f_meta.stored_filename)
                    if os.path.exists(f_path):
                        with open(f_path, "r", encoding="utf-8", errors="ignore") as f_read:
                            existing_files_data.append((format_file_row(f_meta), f_read.read()))
                            
                similarity_results = calculate_text_similarity(decoded_content, existing_files_data)
                if similarity_results:
                    top_meta, score = similarity_results[0]
                    if score >= 0.85:
                        dup_log = DuplicateLog(
                            filename=file.filename,
                            file_size=file_size,
                            sha256_hash=sha256_hash,
                            duplicate_type="near",
                            similarity_score=score,
                            target_file_id=str(top_meta["id"]),
                            target_file_name=top_meta["filename"]
                        )
                        db.add(dup_log)
                        db.commit()
                        return {
                            "status": "duplicate",
                            "duplicate_type": "near",
                            "similarity": round(score, 4),
                            "message": f"AI Near-Duplicate Warning: Content is {score*100:.1f}% similar to '{top_meta['filename']}'.",
                            "existing_file": top_meta
                        }
            except Exception as e:
                print(f"Error during NLP near-duplicate check: {e}")
                
        elif category == "image":
            try:
                p_hash = calculate_image_ahash(content)
                if p_hash:
                    existing_image_files = db.query(FileModel).filter(
                        FileModel.category.ilike("image"),
                        FileModel.is_deleted.is_(False)
                    ).all()
                    
                    max_score = 0.0
                    top_meta = None
                    for f_meta in existing_image_files:
                        stored_p_hash = f_meta.extension
                        # Store image ahash inside file or compare dynamically
                        # Calculate similarity if hash available
                    if max_score >= 0.85 and top_meta:
                        dup_log = DuplicateLog(
                            filename=file.filename,
                            file_size=file_size,
                            sha256_hash=sha256_hash,
                            duplicate_type="near",
                            similarity_score=max_score,
                            target_file_id=str(top_meta["id"]),
                            target_file_name=top_meta["filename"]
                        )
                        db.add(dup_log)
                        db.commit()
                        return {
                            "status": "duplicate",
                            "duplicate_type": "near",
                            "similarity": round(max_score, 4),
                            "message": f"AI Image Similarity Warning: Image is {max_score*100:.1f}% similar to '{top_meta['filename']}'.",
                            "existing_file": top_meta
                        }
            except Exception as e:
                print(f"Error during image near-duplicate check: {e}")

    # 3. Store file binary securely on disk
    ext = os.path.splitext(file.filename)[1]
    stored_name = f"{sha256_hash}{ext}"
    stored_path = os.path.join(STORAGE_DIR, stored_name)
    
    with open(stored_path, "wb") as f_out:
        f_out.write(content)
        
    # 4. Save metadata record to PostgreSQL database
    # Get standard default user ID or create system owner
    from src.entities.user import User
    default_user = db.query(User).first()
    if not default_user:
        default_user = User(
            username="system_user",
            email="system@trustshare.local",
            password_hash="placeholder"
        )
        db.add(default_user)
        db.commit()
        db.refresh(default_user)
        
    new_file = FileModel(
        owner_id=default_user.id,
        original_filename=file.filename,
        stored_filename=stored_name,
        extension=ext.lstrip("."),
        mime_type=file.content_type or "application/octet-stream",
        file_path=stored_path,
        size=file_size,
        checksum=sha256_hash,
        category=category.capitalize()
    )
    db.add(new_file)
    db.commit()
    db.refresh(new_file)
    
    return {
        "status": "success",
        "message": "File uploaded and stored securely.",
        "file": format_file_row(new_file)
    }

@router.get("/api/files")
def list_files(db: Session = Depends(get_db)):
    files = db.query(FileModel).filter(FileModel.is_deleted.is_(False)).order_by(desc(FileModel.created_at)).all()
    return [format_file_row(f) for f in files]

@router.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    total_files = db.query(func.count(FileModel.id)).filter(FileModel.is_deleted.is_(False)).scalar() or 0
    blocked_duplicates = db.query(func.count(DuplicateLog.id)).scalar() or 0
    storage_saved = db.query(func.sum(DuplicateLog.file_size)).scalar() or 0
    storage_used = db.query(func.sum(FileModel.size)).filter(FileModel.is_deleted.is_(False)).scalar() or 0
    
    return {
        "total_files": total_files,
        "blocked_duplicates": blocked_duplicates,
        "storage_saved_bytes": int(storage_saved),
        "storage_used_bytes": int(storage_used)
    }

@router.get("/api/duplicates")
def list_duplicates(db: Session = Depends(get_db)):
    logs = db.query(DuplicateLog).order_by(desc(DuplicateLog.timestamp)).all()
    return [format_log_row(l) for l in logs]

@router.get("/api/download/{file_id}")
def download_file(file_id: str, db: Session = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(file_id)
        file_record = db.query(FileModel).filter(FileModel.id == f_uuid).first()
    except Exception:
        file_record = db.query(FileModel).filter(FileModel.stored_filename.startswith(file_id)).first()
        
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found in database.")
        
    file_path = os.path.join(STORAGE_DIR, file_record.stored_filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File binary not found on storage disk.")
        
    return FileResponse(
        path=file_path,
        media_type=file_record.mime_type,
        filename=file_record.original_filename
    )

@router.delete("/api/files/{file_id}")
def delete_file(file_id: str, db: Session = Depends(get_db)):
    try:
        f_uuid = uuid.UUID(file_id)
        file_record = db.query(FileModel).filter(FileModel.id == f_uuid).first()
    except Exception:
        file_record = db.query(FileModel).filter(FileModel.stored_filename.startswith(file_id)).first()
        
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found in database.")
        
    file_path = os.path.join(STORAGE_DIR, file_record.stored_filename)
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file from disk: {e}")
            
    db.delete(file_record)
    db.commit()
    return {"status": "success", "message": f"Successfully deleted '{file_record.original_filename}'."}
