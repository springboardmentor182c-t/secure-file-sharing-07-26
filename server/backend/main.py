import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, FileResponse as FastAPIFileResponse

# Database & detector imports
try:
    from server.backend.database import (
        init_db,
        store_file_metadata,
        check_exact_duplicate,
        get_all_files,
        get_files_by_category,
        get_file_by_id,
        log_duplicate_attempt,
        get_duplicate_logs,
        get_dashboard_stats,
        delete_file_by_id
    )
    from server.backend.duplicate_detector import (
        calculate_sha256,
        get_file_category,
        calculate_text_similarity,
        calculate_image_ahash,
        calculate_image_similarity
    )
    from server.backend.models import (
        FileResponse,
        DuplicateLogResponse,
        DashboardStatsResponse,
        UploadSuccessResponse,
        UploadDuplicateResponse
    )
except ImportError:
    from database import (
        init_db,
        store_file_metadata,
        check_exact_duplicate,
        get_all_files,
        get_files_by_category,
        get_file_by_id,
        log_duplicate_attempt,
        get_duplicate_logs,
        get_dashboard_stats,
        delete_file_by_id
    )
    from duplicate_detector import (
        calculate_sha256,
        get_file_category,
        calculate_text_similarity,
        calculate_image_ahash,
        calculate_image_similarity
    )
    from models import (
        FileResponse,
        DuplicateLogResponse,
        DashboardStatsResponse,
        UploadSuccessResponse,
        UploadDuplicateResponse
    )

# Paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
STORAGE_DIR = os.path.join(BASE_DIR, "storage")
FRONTEND_DIR = os.path.join(BASE_DIR, "client", "frontend")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup storage directory
    os.makedirs(STORAGE_DIR, exist_ok=True)
    # Initialize DB tables
    init_db()
    yield

app = FastAPI(
    title="Secure File Sharing - AI Duplicate File Detection System",
    description="An intelligent duplicate and similarity detection module for secure file storage.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration to allow local web testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Helpers to transform SQLite rows into response-compatible dicts
def format_file_row(row: dict) -> dict:
    return {
        "id": row["id"],
        "filename": row["filename"],
        "file_size": row["file_size"],
        "mime_type": row["mime_type"],
        "sha256_hash": row["sha256_hash"],
        "stored_name": row["stored_name"],
        "category": row["category"],
        "upload_date": str(row["upload_date"])
    }

def format_log_row(row: dict) -> dict:
    return {
        "id": row["id"],
        "filename": row["filename"],
        "file_size": row["file_size"],
        "sha256_hash": row["sha256_hash"],
        "duplicate_type": row["duplicate_type"],
        "similarity_score": float(row["similarity_score"]),
        "target_file_id": row["target_file_id"],
        "target_file_name": row["target_file_name"],
        "timestamp": str(row["timestamp"])
    }

# API Endpoints

@app.post("/api/upload", response_model=None)
async def upload_file(
    file: UploadFile = File(...),
    bypass_near_duplicate: bool = Form(False)
):
    """
    Handles file upload, checks for exact duplicates (SHA-256) and AI near-duplicates.
    If 'bypass_near_duplicate' is True, bypasses near-duplicate checks and forces upload.
    """
    # 1. Read file bytes
    content = await file.read()
    file_size = len(content)
    
    if file_size == 0:
        raise HTTPException(status_code=400, detail="Cannot upload an empty file.")
        
    # 2. Generate SHA-256 Hash
    sha256_hash = calculate_sha256(content)
    
    # 3. Check for Exact Duplicate
    exact_match = check_exact_duplicate(sha256_hash)
    if exact_match:
        # Log exact duplicate occurrence
        log_duplicate_attempt(
            filename=file.filename,
            file_size=file_size,
            sha256_hash=sha256_hash,
            duplicate_type="exact",
            similarity_score=1.0,
            target_file_id=exact_match["id"],
            target_file_name=exact_match["filename"]
        )
        return {
            "status": "duplicate",
            "duplicate_type": "exact",
            "similarity": 1.0,
            "message": f"Exact duplicate detected. This content already exists as '{exact_match['filename']}'.",
            "existing_file": format_file_row(exact_match)
        }
        
    # 4. Categorize File for AI check
    category = get_file_category(file.filename, file.content_type or "")
    
    # 5. Check for Near-Duplicates (unless bypassed by the user)
    if not bypass_near_duplicate:
        # NLP Near-Duplicate for Text Files
        if category == 'text':
            try:
                decoded_content = content.decode('utf-8', errors='ignore')
                existing_text_files = get_files_by_category('text')
                
                # Fetch text contents from local files for analysis
                existing_files_data = []
                for f_meta in existing_text_files:
                    f_path = os.path.join(STORAGE_DIR, f_meta["stored_name"])
                    if os.path.exists(f_path):
                        with open(f_path, 'r', encoding='utf-8', errors='ignore') as f_read:
                            existing_files_data.append((f_meta, f_read.read()))
                            
                # Calculate similarity score
                similarity_results = calculate_text_similarity(decoded_content, existing_files_data)
                
                if similarity_results:
                    top_meta, score = similarity_results[0]
                    if score >= 0.85:  # Similarity threshold
                        log_duplicate_attempt(
                            filename=file.filename,
                            file_size=file_size,
                            sha256_hash=sha256_hash,
                            duplicate_type="near",
                            similarity_score=score,
                            target_file_id=top_meta["id"],
                            target_file_name=top_meta["filename"]
                        )
                        return {
                            "status": "duplicate",
                            "duplicate_type": "near",
                            "similarity": round(score, 4),
                            "message": f"AI Near-Duplicate Warning: Content is {score*100:.1f}% similar to '{top_meta['filename']}'.",
                            "existing_file": format_file_row(top_meta)
                        }
            except Exception as e:
                # If text processing fails, we fall back to standard file save
                print(f"Error during NLP near-duplicate checks: {e}")
                
        # Image Perceptual Hashing Near-Duplicate check
        elif category == 'image':
            try:
                p_hash = calculate_image_ahash(content)
                if p_hash:
                    existing_image_files = get_files_by_category('image')
                    max_score = 0.0
                    top_meta = None
                    
                    for f_meta in existing_image_files:
                        stored_p_hash = f_meta.get("perceptual_hash")
                        if stored_p_hash:
                            score = calculate_image_similarity(p_hash, stored_p_hash)
                            if score > max_score:
                                max_score = score
                                top_meta = f_meta
                                
                    if max_score >= 0.85:  # Perceptual similarity threshold
                        log_duplicate_attempt(
                            filename=file.filename,
                            file_size=file_size,
                            sha256_hash=sha256_hash,
                            duplicate_type="near",
                            similarity_score=max_score,
                            target_file_id=top_meta["id"],
                            target_file_name=top_meta["filename"]
                        )
                        return {
                            "status": "duplicate",
                            "duplicate_type": "near",
                            "similarity": round(max_score, 4),
                            "message": f"AI Image Similarity Warning: Image is {max_score*100:.1f}% similar to '{top_meta['filename']}'.",
                            "existing_file": format_file_row(top_meta)
                        }
            except Exception as e:
                print(f"Error during Image near-duplicate checks: {e}")
                
    # 6. Save File Securely to storage
    ext = os.path.splitext(file.filename)[1]
    stored_name = f"{sha256_hash}{ext}"
    stored_path = os.path.join(STORAGE_DIR, stored_name)
    
    with open(stored_path, "wb") as f_out:
        f_out.write(content)
        
    # Calculate image hash for storing if applicable
    perceptual_hash = None
    if category == 'image':
        try:
            perceptual_hash = calculate_image_ahash(content)
        except Exception:
            pass
            
    # Save database record
    stored_record = store_file_metadata(
        filename=file.filename,
        file_size=file_size,
        mime_type=file.content_type or "application/octet-stream",
        sha256_hash=sha256_hash,
        stored_name=stored_name,
        category=category,
        perceptual_hash=perceptual_hash
    )
    
    return {
        "status": "success",
        "message": "File uploaded and stored securely.",
        "file": format_file_row(stored_record)
    }

@app.get("/api/files", response_model=list[FileResponse])
def list_files():
    """Returns a list of all stored file records."""
    files = get_all_files()
    return [format_file_row(f) for f in files]

@app.get("/api/stats", response_model=DashboardStatsResponse)
def get_stats():
    """Returns storage analytics and duplicate prevention metrics."""
    return get_dashboard_stats()

@app.get("/api/duplicates", response_model=list[DuplicateLogResponse])
def list_duplicates():
    """Returns a history of prevented duplicate uploads."""
    logs = get_duplicate_logs()
    return [format_log_row(l) for l in logs]

@app.get("/api/download/{file_id}")
def download_file(file_id: int):
    """Securely streams the requested file from disk for download."""
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found in database.")
        
    file_path = os.path.join(STORAGE_DIR, file_record["stored_name"])
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File binary not found on storage disk.")
        
    return FastAPIFileResponse(
        path=file_path,
        media_type=file_record["mime_type"],
        filename=file_record["filename"]
    )

@app.delete("/api/files/{file_id}")
def delete_file(file_id: int):
    """Deletes a file from both storage disk and database metadata records."""
    file_record = get_file_by_id(file_id)
    if not file_record:
        raise HTTPException(status_code=404, detail="File not found in database.")
        
    file_path = os.path.join(STORAGE_DIR, file_record["stored_name"])
    
    # Remove local file if it exists
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting local file: {e}")
            
    # Remove record from database
    deleted = delete_file_by_id(file_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete database record.")
        
    return {"status": "success", "message": f"Successfully deleted '{file_record['filename']}'."}

# Static file routing for Serving UI
os.makedirs(FRONTEND_DIR, exist_ok=True)
os.makedirs(os.path.join(FRONTEND_DIR, "css"), exist_ok=True)
os.makedirs(os.path.join(FRONTEND_DIR, "js"), exist_ok=True)

@app.get("/", response_class=HTMLResponse)
async def serve_index():
    """Serves the dashboard main page."""
    index_path = os.path.join(FRONTEND_DIR, "index.html")
    if os.path.exists(index_path):
        with open(index_path, "r", encoding="utf-8") as f:
            return HTMLResponse(content=f.read())
    return HTMLResponse(content="<h1>Dashboard UI index.html not found! Please run the initialization script.</h1>", status_code=404)

# Mount CSS & JS subdirectories if they contain files, fallback gracefully
app.mount("/css", StaticFiles(directory=os.path.join(FRONTEND_DIR, "css")), name="css")
app.mount("/js", StaticFiles(directory=os.path.join(FRONTEND_DIR, "js")), name="js")
