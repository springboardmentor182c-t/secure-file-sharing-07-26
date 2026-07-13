from src.database.core import engine

try:
    conn = engine.connect()
    print("Database Connected Successfully")
    conn.close()
except Exception as e:
    print(e)