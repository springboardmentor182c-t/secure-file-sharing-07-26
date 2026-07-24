from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from src.entities.issue import Issue
from src.database.core import SessionLocal
from src.entities.user import User
from src.schemas.user import UserCreate
from src.entities.audit_log import AuditLog
from src.entities.file import File
from fastapi import Body
from src.schemas.file import FileCreate
from fastapi.responses import StreamingResponse
from src.entities.system_health import SystemHealth
import io
import csv

router = APIRouter(prefix="/admin", tags=["Admin"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard")
def dashboard(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_files = db.query(File).count()

    total_size = db.query(func.sum(File.file_size)).scalar()
    if total_size is None:
        total_size = 0

    active_users = db.query(User).filter(User.status == "Active").count()
    suspended_users = db.query(User).filter(User.status == "Suspended").count()

    health = db.query(SystemHealth).first()
    open_issues = db.query(Issue).count()

    return {
        "total_users": total_users,
        "active_users": active_users,
        "suspended_users": suspended_users,
        "storage_used": f"{total_size} KB",
        "storage_limit": "50 GB",
        "system_health": health.system_health if health else "0%",
        "open_issues": open_issues,
        "total_files": total_files
    }
@router.get("/users")
def get_users(db: Session = Depends(get_db)):
    users = db.query(User).all()

    return [
        {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "storage_used": user.storage_used,
            "last_login": user.last_login,
            "status": user.status
        }
        for user in users
    ]
@router.post("/users")
def add_user(user: UserCreate, db: Session = Depends(get_db)):
    new_user = User(
        name=user.name,
        email=user.email,
        role=user.role,
        storage_used=user.storage_used,
        last_login=user.last_login,
        status=user.status
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "User added successfully",
        "id": new_user.id
    }
@router.put("/users/{user_id}")
def update_user(user_id: int, updated_user: UserCreate, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"message": "User not found"}

    user.name = updated_user.name
    user.email = updated_user.email
    user.role = updated_user.role
    user.storage_used = updated_user.storage_used
    user.last_login = updated_user.last_login
    user.status = updated_user.status

    db.commit()
    db.refresh(user)

    return {
        "message": "User updated successfully",
        "id": user.id
    }
@router.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        return {"message": "User not found"}

    db.delete(user)
    db.commit()

    return {"message": "User deleted successfully"}

@router.get("/storage")
def storage(db: Session = Depends(get_db)):
    users = db.query(User).all()

    total_storage = 50.0
    used_storage = 0.0
    user_storage = []

    for user in users:
        size = float(user.storage_used.replace(" GB", "").replace("GB", ""))

        used_storage += size

        user_storage.append({
            "name": user.name,
            "storage_used": user.storage_used
        })

    percentage = round((used_storage / total_storage) * 100, 1)

    return {
        "total_storage": f"{total_storage} GB",
        "used_storage": f"{used_storage} GB",
        "percentage": percentage,
        "users": user_storage
    }
@router.get("/storage/file-types")
def storage_file_types(db: Session = Depends(get_db)):
    files = db.query(File).all()

    total_files = len(files)

    if total_files == 0:
        return []

    file_type_count = {}

    for file in files:
        file_type = file.file_type

        if file_type in file_type_count:
            file_type_count[file_type] += 1
        else:
            file_type_count[file_type] = 1

    result = []

    for file_type, count in file_type_count.items():
        percentage = round((count / total_files) * 100, 1)

        result.append({
            "type": file_type,
            "percentage": percentage
        })

    return result
@router.get("/system-health")
def system_health(db: Session = Depends(get_db)):
    health = db.query(SystemHealth).first()

    issues = db.query(Issue).all()

    recent_events = [
        {
            "event": issue.title,
            "time": issue.status
        }
        for issue in issues
    ]

    return {
        "api_response_time": health.api_response_time,
        "database_load": health.database_load,
        "storage_io": health.storage_io,
        "active_connections": health.active_connections,
        "cpu_usage": health.cpu_usage,
        "error_rate": health.error_rate,
        "recent_events": recent_events
    }
     

@router.get("/audit-reports")
def audit_reports(db: Session = Depends(get_db)):
    reports = db.query(AuditLog).all()

    return [
        {
            "id": report.id,
            "report": report.report,
            "period": report.period,
            "generated": report.generated,
            "events": report.events,
            "findings": report.findings
        }
        for report in reports
    ]
@router.get("/audit-reports/download")
def download_audit_reports(db: Session = Depends(get_db)):
    reports = db.query(AuditLog).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["Report", "Period", "Generated", "Events", "Findings"])

    for report in reports:
        writer.writerow([
            report.report,
            report.period,
            report.generated,
            report.events,
            report.findings
        ])

    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": "attachment; filename=audit_reports.csv"
        }
    )
@router.get("/files")
def get_files(db: Session = Depends(get_db)):
    files = db.query(File).all()

    return [
        {
            "id": file.id,
            "file_name": file.file_name,
            "file_size": file.file_size,
            "file_type": file.file_type,
            "uploaded_by": file.uploaded_by,
            "uploaded_at": file.uploaded_at
        }
        for file in files
    ]
@router.post("/files")
def add_file(file: FileCreate, db: Session = Depends(get_db)):
    new_file = File(
        file_name=file.file_name,
        file_size=file.file_size,
        file_type=file.file_type,
        uploaded_by=file.uploaded_by,
        uploaded_at=file.uploaded_at
    )

    db.add(new_file)
    db.commit()
    db.refresh(new_file)

    return {
        "message": "File added successfully",
        "id": new_file.id
    }
@router.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        return {"message": "File not found"}

    db.delete(file)
    db.commit()

    return {"message": "File deleted successfully"}
@router.put("/files/{file_id}")
def update_file(file_id: int, updated_file: FileCreate, db: Session = Depends(get_db)):
    file = db.query(File).filter(File.id == file_id).first()

    if not file:
        return {"message": "File not found"}

    file.file_name = updated_file.file_name
    file.file_size = updated_file.file_size
    file.file_type = updated_file.file_type
    file.uploaded_by = updated_file.uploaded_by
    file.uploaded_at = updated_file.uploaded_at

    db.commit()
    db.refresh(file)

    return {
        "message": "File updated successfully",
        "file": {
            "id": file.id,
            "file_name": file.file_name,
            "file_size": file.file_size,
            "file_type": file.file_type,
            "uploaded_by": file.uploaded_by,
            "uploaded_at": file.uploaded_at
        }
    }