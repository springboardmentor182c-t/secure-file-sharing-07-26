from src.database.init_db import init_db
from src.database.core import SessionLocal
from src.entities.file import File
from src.files import service

init_db()
db = SessionLocal()
try:
    db.query(File).delete()
    db.commit()

    file = File(
        original_name='test.txt',
        stored_name='test.txt',
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
    db.add(file)
    db.commit()

    result = service._detect_duplicate(db, 1, b'hello', 'copy.txt', 'text/plain', 'abc')
    print('result=', result)
finally:
    db.close()
