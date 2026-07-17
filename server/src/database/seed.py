"""
Dev bootstrap script - creates exactly ONE real user row in the database
so you have a valid X-User-Id to test the Shared Links API with.

This intentionally does NOT insert any fake files/shared links anymore -
those used to be hardcoded "dummy data" that is not needed:
every file and shared link you see in the app from now on should be one
you actually created through the real API (POST /files, POST /shared-links).

Usage:
    python -m src.database.seed --email you@example.com --name "Your Name"

If a user with that email already exists, the script just prints its id
instead of creating a duplicate, so it's safe to re-run.
"""
import argparse

from src.database.core import DATABASE_URL, SessionLocal, create_all_tables
from src.entities.user import User


def seed(email: str, full_name: str) -> None:
    # Table creation here is a convenience for the SQLite opt-in path only.
    # Postgres (the default / production path) is always migrated with
    # `alembic upgrade head` instead - see server/README.md.
    if DATABASE_URL.startswith("sqlite"):
        create_all_tables()

    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("A user with this email already exists - reusing it.")
            print(f"  user id -> {existing.id}")
            print(f"  Send requests with header:  X-User-Id: {existing.id}")
            return

        user = User(email=email, full_name=full_name)
        db.add(user)
        db.commit()
        db.refresh(user)

        print("Created 1 real user:")
        print(f"  user id -> {user.id}")
        print(f"  Send requests with header:  X-User-Id: {user.id}")
    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a real dev user to test the API with.")
    parser.add_argument("--email", required=True, help="Email for the dev user")
    parser.add_argument("--name", required=True, dest="full_name", help="Full name for the dev user")
    args = parser.parse_args()
    seed(email=args.email, full_name=args.full_name)
