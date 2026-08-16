import urllib.request

urls = [
    "http://127.0.0.1:8000/health",
    "http://localhost:8000/health",
    "http://127.0.0.1:8000/dashboard/stats",
    "http://localhost:8000/dashboard/stats",
    "http://127.0.0.1:8000/files",
    "http://localhost:8000/files",
    "http://127.0.0.1:8000/users",
    "http://localhost:8000/users",
]

for p in urls:
    try:
        r = urllib.request.urlopen(p, timeout=5)
        data = r.read(500).decode("utf-8", errors="ignore")
        print(f"{p} OK {r.status}")
        print(data)
    except Exception as e:
        print(f"{p} ERROR {type(e).__name__}: {e}")
