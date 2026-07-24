import os
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy.sql import func

from src.todos.models import File, Folder, FileVersion


# =====================================================
# STORAGE CONFIGURATION
# =====================================================

BASE_DIR = Path(__file__).resolve().parents[2]
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =====================================================
# FOLDER SERVICES
# =====================================================


# =====================================================
# GET ALL FOLDERS
# =====================================================

def get_folders(
    db: Session,
    owner_id: uuid.UUID
):
    return (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.is_deleted.is_(False)
        )
        .order_by(Folder.created_at.desc())
        .all()
    )


# =====================================================
# CREATE FOLDER
# =====================================================

def create_folder(
    db: Session,
    owner_id: uuid.UUID,
    folder_name: str,
    description: str | None = None,
    parent_folder_id: uuid.UUID | None = None
):
    folder_name = folder_name.strip()

    if not folder_name:
        raise HTTPException(
            status_code=400,
            detail="Folder name cannot be empty"
        )

    existing_folder = (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.folder_name == folder_name,
            Folder.is_deleted.is_(False)
        )
        .first()
    )

    if existing_folder:
        raise HTTPException(
            status_code=409,
            detail="Folder already exists"
        )

    folder = Folder(
        owner_id=owner_id,
        parent_folder_id=parent_folder_id,
        folder_name=folder_name,
        description=description,
        is_deleted=False
    )

    try:
        db.add(folder)
        db.commit()
        db.refresh(folder)

        return folder

    except Exception as e:
        db.rollback()

        print(
            "CREATE FOLDER ERROR:",
            repr(e)
        )

        raise


# =====================================================
# RENAME FOLDER
# =====================================================

def rename_folder(
    db: Session,
    folder_id: uuid.UUID,
    owner_id: uuid.UUID,
    new_name: str
):
    folder = (
        db.query(Folder)
        .filter(
            Folder.id == folder_id,
            Folder.owner_id == owner_id,
            Folder.is_deleted.is_(False)
        )
        .first()
    )

    if not folder:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    new_name = new_name.strip()

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="Folder name cannot be empty"
        )

    if folder.folder_name == new_name:
        return folder

    existing_folder = (
        db.query(Folder)
        .filter(
            Folder.owner_id == owner_id,
            Folder.folder_name == new_name,
            Folder.id != folder_id,
            Folder.is_deleted.is_(False)
        )
        .first()
    )

    if existing_folder:
        raise HTTPException(
            status_code=409,
            detail="Folder already exists"
        )

    try:
        folder.folder_name = new_name

        db.commit()
        db.refresh(folder)

        return folder

    except Exception as e:
        db.rollback()

        print(
            "RENAME FOLDER ERROR:",
            repr(e)
        )

        raise


# =====================================================
# DELETE FOLDER
# =====================================================

def delete_folder(
    db: Session,
    folder_id: uuid.UUID,
    owner_id: uuid.UUID
):
    """
    Soft deletes a folder.

    Files inside the folder are moved back
    to All Files by setting folder_id = NULL.
    """

    folder = (
        db.query(Folder)
        .filter(
            Folder.id == folder_id,
            Folder.owner_id == owner_id,
            Folder.is_deleted.is_(False)
        )
        .first()
    )

    if not folder:
        raise HTTPException(
            status_code=404,
            detail="Folder not found"
        )

    try:

        # Move files to All Files
        (
            db.query(File)
            .filter(
                File.owner_id == owner_id,
                File.folder_id == folder_id,
                File.is_deleted.is_(False)
            )
            .update(
                {
                    File.folder_id: None
                },
                synchronize_session=False
            )
        )

        # Soft delete folder
        folder.is_deleted = True

        db.commit()
        db.refresh(folder)

        return folder

    except Exception as e:

        db.rollback()

        print(
            "DELETE FOLDER ERROR:",
            repr(e)
        )

        raise


# =====================================================
# FILE SERVICES
# =====================================================


# =====================================================
# GET ALL FILES
# =====================================================

def get_files(
    db: Session,
    owner_id: uuid.UUID,
    folder_id: uuid.UUID | None = None
):
    query = (
        db.query(File)
        .filter(
            File.owner_id == owner_id,
            File.is_deleted.is_(False)
        )
    )

    if folder_id is not None:
        query = query.filter(
            File.folder_id == folder_id
        )

    return (
        query
        .order_by(File.uploaded_at.desc())
        .all()
    )


# =====================================================
# GET ONE FILE
# =====================================================

def get_file_by_id(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID
):
    file_record = (
        db.query(File)
        .filter(
            File.id == file_id,
            File.owner_id == owner_id,
            File.is_deleted.is_(False)
        )
        .first()
    )

    if not file_record:
        raise HTTPException(
            status_code=404,
            detail="File not found"
        )

    return file_record


# =====================================================
# UPLOAD FILE
# =====================================================

def upload_file(
    db: Session,
    uploaded_file: UploadFile,
    owner_id: uuid.UUID,
    folder_id: uuid.UUID | None = None
):
    print("\n")
    print("==========================================")
    print("UPLOAD_FILE SERVICE STARTED")
    print("==========================================")
    print("OWNER ID:", owner_id)
    print("FOLDER ID:", folder_id)
    print(
        "UPLOADED FILE:",
        uploaded_file.filename
    )
    print("==========================================")

    # =================================================
    # VALIDATE FILE
    # =================================================

    if not uploaded_file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file"
        )

    # =================================================
    # VALIDATE FOLDER
    # =================================================

    if folder_id is not None:

        folder = (
            db.query(Folder)
            .filter(
                Folder.id == folder_id,
                Folder.owner_id == owner_id,
                Folder.is_deleted.is_(False)
            )
            .first()
        )

        if not folder:
            raise HTTPException(
                status_code=404,
                detail="Folder not found"
            )

    # =================================================
    # PREPARE FILE NAME
    # =================================================

    original_name = os.path.basename(
        uploaded_file.filename
    )

    extension = Path(
        original_name
    ).suffix.lower()

    extension_without_dot = (
        extension.lstrip(".")
    )

    # Unique physical file name
    stored_name = (
        f"{uuid.uuid4()}{extension}"
    )

    destination = (
        UPLOAD_DIR / stored_name
    )

    print(
        "ORIGINAL NAME:",
        original_name
    )

    print(
        "STORAGE DESTINATION:",
        destination
    )

    try:

        # =================================================
        # SAVE PHYSICAL FILE
        # =================================================

        print(
            "Saving physical file..."
        )

        with destination.open("wb") as buffer:

            while True:

                chunk = (
                    uploaded_file.file.read(
                        1024 * 1024
                    )
                )

                if not chunk:
                    break

                buffer.write(chunk)

        print(
            "Physical file saved successfully."
        )

        # =================================================
        # GET FILE SIZE
        # =================================================

        file_size = (
            destination.stat().st_size
        )

        print(
            "FILE SIZE:",
            file_size
        )

        # =================================================
        # CREATE FILE RECORD
        # =================================================

        file_record = File(
            owner_id=owner_id,
            folder_id=folder_id,
            file_name=original_name,
            original_name=original_name,
            file_extension=extension_without_dot,
            mime_type=uploaded_file.content_type,
            file_size=file_size,
            storage_path=str(destination),
            encrypted_path=None,
            checksum=None,
            is_deleted=False
        )

        print(
            "Adding file record..."
        )

        db.add(file_record)

        # =================================================
        # FLUSH FILE
        # =================================================

        print(
            "Flushing file record..."
        )

        db.flush()

        print("")
        print("==========================================")
        print("FILE CREATED SUCCESSFULLY")
        print("==========================================")
        print(
            "FILE ID:",
            file_record.id
        )
        print(
            "FILE NAME:",
            file_record.file_name
        )
        print(
            "OWNER ID:",
            owner_id
        )
        print("==========================================")

        # =================================================
        # CREATE VERSION 1
        # =================================================

        print("")
        print("==========================================")
        print("CREATING VERSION 1")
        print("==========================================")

        version_record = FileVersion(
            file_id=file_record.id,
            version_number=1,
            storage_path=str(destination),
            encrypted_path=file_record.encrypted_path,
            checksum=file_record.checksum,
            uploaded_by=owner_id
        )

        print(
            "VERSION OBJECT CREATED"
        )

        print(
            "VERSION FILE ID:",
            version_record.file_id
        )

        print(
            "VERSION NUMBER:",
            version_record.version_number
        )

        print(
            "VERSION STORAGE PATH:",
            version_record.storage_path
        )

        # =================================================
        # ADD VERSION
        # =================================================

        db.add(version_record)

        print(
            "Version record added to session."
        )

        print(
            "Flushing version record..."
        )

        db.flush()

        print("")
        print("==========================================")
        print("VERSION FLUSH SUCCESSFUL")
        print("==========================================")

        print(
            "VERSION ID:",
            version_record.id
        )

        # =================================================
        # COMMIT BOTH
        # =================================================

        print(
            "Committing transaction..."
        )

        db.commit()

        print("")
        print("==========================================")
        print("DATABASE COMMIT SUCCESSFUL")
        print("==========================================")

        # =================================================
        # REFRESH RECORDS
        # =================================================

        db.refresh(file_record)
        db.refresh(version_record)

        print(
            "FILE ID:",
            file_record.id
        )

        print(
            "VERSION ID:",
            version_record.id
        )

        print(
            "VERSION FILE ID:",
            version_record.file_id
        )

        print(
            "VERSION NUMBER:",
            version_record.version_number
        )

        print("==========================================")
        print("UPLOAD_FILE SERVICE FINISHED")
        print("==========================================")
        print("\n")

        return file_record

    # =================================================
    # HTTP ERROR
    # =================================================

    except HTTPException:

        db.rollback()

        print("")
        print("==========================================")
        print("UPLOAD HTTP ERROR")
        print("DATABASE ROLLBACK")
        print("==========================================")

        if destination.exists():

            try:
                destination.unlink()

                print(
                    "Physical file removed."
                )

            except OSError as e:

                print(
                    "Unable to remove physical file:",
                    repr(e)
                )

        raise

    # =================================================
    # OTHER ERROR
    # =================================================

    except Exception as e:

        db.rollback()

        print("")
        print("==========================================")
        print("UPLOAD SERVICE ERROR")
        print("==========================================")
        print(
            "ERROR TYPE:",
            type(e).__name__
        )
        print(
            "ERROR:",
            repr(e)
        )
        print("==========================================")

        if destination.exists():

            try:
                destination.unlink()

                print(
                    "Physical file removed because "
                    "database operation failed."
                )

            except OSError as remove_error:

                print(
                    "FILE REMOVE ERROR:",
                    repr(remove_error)
                )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to upload file: "
                + str(e)
            )
        )


# =====================================================
# RENAME FILE
# =====================================================

def rename_file(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    new_name: str
):
    file_record = get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    new_name = new_name.strip()

    if not new_name:
        raise HTTPException(
            status_code=400,
            detail="File name cannot be empty"
        )

    try:

        file_record.file_name = (
            new_name
        )

        db.commit()
        db.refresh(file_record)

        return file_record

    except Exception as e:

        db.rollback()

        print(
            "RENAME FILE ERROR:",
            repr(e)
        )

        raise


# =====================================================
# DELETE FILE
# =====================================================

def delete_file(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID
):
    file_record = get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    try:

        file_record.is_deleted = True

        db.commit()
        db.refresh(file_record)

        return file_record

    except Exception as e:

        db.rollback()

        print(
            "DELETE FILE ERROR:",
            repr(e)
        )

        raise


# =====================================================
# FILE VERSION SERVICES
# =====================================================


# =====================================================
# GET ALL VERSIONS OF A FILE
# =====================================================

def get_file_versions(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID
):
    # Verify file exists and belongs to owner
    get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    versions = (
        db.query(FileVersion)
        .filter(
            FileVersion.file_id == file_id
        )
        .order_by(
            FileVersion.version_number.desc()
        )
        .all()
    )

    return versions


# =====================================================
# GET ONE VERSION
# =====================================================

def get_file_version_by_id(
    db: Session,
    file_id: uuid.UUID,
    version_id: uuid.UUID,
    owner_id: uuid.UUID
):
    # Verify file ownership
    get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    version = (
        db.query(FileVersion)
        .filter(
            FileVersion.id == version_id,
            FileVersion.file_id == file_id
        )
        .first()
    )

    if not version:

        raise HTTPException(
            status_code=404,
            detail="File version not found"
        )

    return version


# =====================================================
# UPLOAD NEW FILE VERSION
# =====================================================

def upload_new_version(
    db: Session,
    file_id: uuid.UUID,
    owner_id: uuid.UUID,
    uploaded_file: UploadFile
):
    print("")
    print("==========================================")
    print("UPLOAD NEW VERSION STARTED")
    print("==========================================")
    print("FILE ID:", file_id)
    print("OWNER ID:", owner_id)
    print(
        "UPLOADED FILE:",
        uploaded_file.filename
    )

    # =================================================
    # VERIFY ORIGINAL FILE
    # =================================================

    file_record = get_file_by_id(
        db=db,
        file_id=file_id,
        owner_id=owner_id
    )

    if not uploaded_file.filename:
        raise HTTPException(
            status_code=400,
            detail="Invalid file"
        )

    # =================================================
    # FIND LATEST VERSION NUMBER
    # =================================================

    latest_version = (
        db.query(FileVersion)
        .filter(
            FileVersion.file_id == file_id
        )
        .order_by(
            FileVersion.version_number.desc()
        )
        .first()
    )

    if latest_version:
        new_version_number = (
            latest_version.version_number + 1
        )
    else:
        new_version_number = 1

    print(
        "NEW VERSION NUMBER:",
        new_version_number
    )

    # =================================================
    # PREPARE PHYSICAL FILE
    # =================================================

    original_name = os.path.basename(
        uploaded_file.filename
    )

    extension = (
        Path(original_name)
        .suffix
        .lower()
    )

    extension_without_dot = (
        extension.lstrip(".")
    )

    stored_name = (
        f"{uuid.uuid4()}{extension}"
    )

    destination = (
        UPLOAD_DIR / stored_name
    )

    print(
        "NEW VERSION STORAGE PATH:",
        destination
    )

    try:

        # =================================================
        # SAVE NEW VERSION PHYSICALLY
        # =================================================

        with destination.open("wb") as buffer:

            while True:

                chunk = (
                    uploaded_file.file.read(
                        1024 * 1024
                    )
                )

                if not chunk:
                    break

                buffer.write(chunk)

        file_size = (
            destination.stat().st_size
        )

        print(
            "NEW VERSION FILE SIZE:",
            file_size
        )

        # =================================================
        # CREATE VERSION RECORD
        # =================================================

        new_version = FileVersion(
            file_id=file_id,
            version_number=new_version_number,
            storage_path=str(destination),
            encrypted_path=None,
            checksum=None,
            uploaded_by=owner_id
        )

        db.add(new_version)

        # Flush first so database errors happen
        # before updating the current file.
        db.flush()

        print(
            "NEW VERSION RECORD CREATED:",
            new_version.id
        )

        # =================================================
        # UPDATE CURRENT FILE
        # =================================================

        # The files table always represents
        # the latest/current version.

        file_record.storage_path = str(
            destination
        )

        file_record.file_name = (
            original_name
        )

        file_record.original_name = (
            original_name
        )

        file_record.file_extension = (
            extension_without_dot
        )

        file_record.mime_type = (
            uploaded_file.content_type
        )

        file_record.file_size = (
            file_size
        )

        # THIS WAS CAUSING YOUR ERROR BEFORE.
        # func is now imported from sqlalchemy.sql.
        file_record.updated_at = (
            func.now()
        )

        # =================================================
        # COMMIT
        # =================================================

        db.commit()

        db.refresh(new_version)
        db.refresh(file_record)

        print("")
        print("==========================================")
        print("NEW VERSION CREATED SUCCESSFULLY")
        print("==========================================")
        print(
            "VERSION NUMBER:",
            new_version.version_number
        )
        print(
            "VERSION ID:",
            new_version.id
        )
        print(
            "FILE ID:",
            file_record.id
        )
        print("==========================================")
        print("")

        return new_version

    # =================================================
    # HTTP ERROR
    # =================================================

    except HTTPException:

        db.rollback()

        if destination.exists():

            try:
                destination.unlink()

            except OSError as e:
                print(
                    "VERSION FILE REMOVE ERROR:",
                    repr(e)
                )

        raise

    # =================================================
    # OTHER ERROR
    # =================================================

    except Exception as e:

        db.rollback()

        if destination.exists():

            try:
                destination.unlink()

            except OSError as remove_error:
                print(
                    "VERSION FILE REMOVE ERROR:",
                    repr(remove_error)
                )

        print("")
        print("==========================================")
        print("UPLOAD VERSION ERROR")
        print("==========================================")
        print(
            "ERROR TYPE:",
            type(e).__name__
        )
        print(
            "ERROR:",
            repr(e)
        )
        print("==========================================")

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to upload new version: "
                + str(e)
            )
        )