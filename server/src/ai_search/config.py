from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

UPLOAD_DIR = BASE_DIR / "uploads"

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

CHUNK_SIZE = 500

CHUNK_OVERLAP = 100

QDRANT_HOST = "localhost"

QDRANT_PORT = 6333

COLLECTION_NAME = "trustshare_documents"