from app.api.v1.dashboard.service import seed_dashboard_data
from app.database.session import SessionLocal, init_db


def main() -> None:
    init_db()
    with SessionLocal() as db:
        seed_dashboard_data(db)


if __name__ == "__main__":
    main()
