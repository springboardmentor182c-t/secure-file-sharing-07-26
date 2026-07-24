import sys
from pathlib import Path

# Add project-root/server to Python path so `src` imports resolve cleanly
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from dotenv import load_dotenv
load_dotenv()  # Load .env file before anything else reads os.getenv()

import uvicorn
from src.api import app
from src.database.init_db import init_db

# Create all tables on startup
init_db()

if __name__ == "__main__":
    uvicorn.run(
        "src.api:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info",
    )







