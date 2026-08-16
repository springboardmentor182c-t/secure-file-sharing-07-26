# TrustShare backend — FastAPI + Uvicorn
# Built from server/requirements.txt as found in the uploaded project.
# python:3.11-slim is used (not 3.14) because sentence-transformers/torch,
# used by the AI recommendation module's local-embedding fallback, has the
# most mature wheel support on 3.11.
FROM python:3.11-slim

# System packages:
# - build-essential + libpq-dev: needed to build psycopg2-binary/cryptography wheels on some archs
# - curl: used by the container HEALTHCHECK below to hit /health
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python deps first so Docker can cache this layer between builds
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Now copy the actual application code
COPY . .

# Pre-download the sentence-transformers embedding model at BUILD time
# (see AI_EMBEDDING_MODEL in .env, default all-MiniLM-L6-v2) so the
# container never needs internet access on first request in AWS, and so
# the first real user request isn't slowed down by a ~90MB model download.
# HF_HOME pins the cache into the image filesystem at a known path.
ENV HF_HOME=/app/.cache/huggingface
RUN python -c "from sentence_transformers import SentenceTransformer; import os; SentenceTransformer(os.getenv('AI_EMBEDDING_MODEL', 'all-MiniLM-L6-v2'))"

# Uploaded files (see FILES_STORAGE_DIR) and the SQLite dev fallback DB live here.
# In production this directory should be a mounted volume - see docker-compose.yml.
RUN mkdir -p /app/storage/files

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# 0.0.0.0 is required: 127.0.0.1/localhost would only accept connections
# from inside this exact container, so the frontend container and the
# host's port mapping would not be able to reach it at all.
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
