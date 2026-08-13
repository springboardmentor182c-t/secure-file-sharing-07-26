import os
import sqlite3

print(os.path.exists('app.db'))
conn = sqlite3.connect('app.db')
cur = conn.cursor()
print(cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='files'").fetchall())
print(cur.execute('PRAGMA table_info(files)').fetchall())
conn.close()
