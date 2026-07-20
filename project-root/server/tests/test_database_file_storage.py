import os
from io import BytesIO

from fastapi import UploadFile
from starlette.datastructures import Headers

from src.entities.file_blob import FileBlob
from src.entities.user import User
from src.files import service
from src.security.seed.seed_allowed_file_types import seed_allowed_file_types


def test_encrypted_upload_round_trip_uses_database_storage(db):
    seed_allowed_file_types(db)
    user = User(
        name="Storage Test",
        email="storage-test@example.com",
        hashed_password="not-used",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    original = b"persistent encrypted database payload"
    upload = UploadFile(
        file=BytesIO(original),
        filename="proof.txt",
        headers=Headers({"content-type": "text/plain"}),
    )

    stored_file = service.upload_file(db, upload, user.id, None, encrypted=True)
    blob = db.query(FileBlob).filter(FileBlob.file_id == stored_file.id).one()

    assert blob.encrypted_data != original
    assert blob.wrapped_key

    original_ciphertext = blob.encrypted_data
    original_wrapped_key = blob.wrapped_key
    service.rotate_file_key(db, stored_file.id, user.id)
    db.refresh(blob)

    assert blob.encrypted_data != original_ciphertext
    assert blob.wrapped_key != original_wrapped_key

    downloaded_path, downloaded_name = service.get_file_path(
        db,
        stored_file.id,
        user.id,
    )
    try:
        assert downloaded_name == "proof.txt"
        assert downloaded_path.read_bytes() == original
    finally:
        os.remove(downloaded_path)
