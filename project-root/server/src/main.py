from dotenv import load_dotenv
load_dotenv()  # Load .env file before anything else reads os.getenv()

import uvicorn
import os
from src.api import app
from src.database.init_db import init_db

# Create all tables on startup
init_db()

if __name__ == "__main__":
    uvicorn.run(
        "src.api:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", "8000")),
        reload=os.getenv("ENVIRONMENT", "development").lower() != "production",
        log_level="info",
    )







