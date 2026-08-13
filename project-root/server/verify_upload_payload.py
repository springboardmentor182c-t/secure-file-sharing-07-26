from io import BytesIO
from fastapi import UploadFile
from src.database.init_db import init_db
from src.database.core import SessionLocal
from src.entities.file import File
from src.files import service

init_db()
db = SessionLocal()
try:
    db.query(File).filter(File.owner_id == 1).delete()
    db.commit()

    existing = File(
        original_name='existing.txt',
        stored_name='existing.txt',
        mimetype='text/plain',
        size=10,
        encrypted=False,
        hash_sha256='abc',
        file_hash='abc',
        embedding=None,
        is_duplicate=False,
        duplicate_of=None,
        similarity_score=None,
        owner_id=1,
        folder_id=None,
    )
    db.add(existing)
    db.commit()

    upload = UploadFile(filename='copy.txt', file=BytesIO(b'hello'))
    payload = service.upload_file(db, upload, 1, None, False)
    print(type(payload).__name__)
    print(payload)
finally:
    db.close()
