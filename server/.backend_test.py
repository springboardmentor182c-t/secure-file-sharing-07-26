from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

paths = [
    "/dashboard/stats",
    "/dashboard/storage-by-user",
    "/dashboard/users",
    "/health",
]

for p in paths:
    try:
        r = client.get(p)
        print(p, r.status_code)
        print(r.text)
    except Exception as exc:
        print(p, "EXCEPTION", type(exc).__name__, exc)
