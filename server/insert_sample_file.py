import uuid
from src.database.core import SessionLocal
from src.entities.file import File

db = SessionLocal()

sample_file = File(
    id=uuid.uuid4(),
    owner_id="441626c7-9147-4ac9-88d4-ee328b75d81f",   # test@example.com
    file_name="sample.txt",
    original_name="sample.txt",
    file_extension=".txt",
    mime_type="text/plain",
    file_size=500,
    storage_path="./sample_files/sample.txt",
    encrypted_path=None,
    is_deleted=False,
)

db.add(sample_file)
db.commit()
print("✅ Inserted file id:", sample_file.id)
db.close()