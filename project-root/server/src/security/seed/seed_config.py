from sqlalchemy.orm import Session
from src.security.models.app_config import AppConfig

DEFAULT_CONFIGS = [
    {
        "config_key": "MAX_FILE_SIZE",
        "config_value": str(100 * 1024 * 1024),
        "description": "Maximum upload size in bytes",
    },
    {
        "config_key": "KEY_ROTATION_DAYS",
        "config_value": "90",
        "description": "Days before encryption key rotation",
    },
]


def seed_configs(db: Session):

    for config in DEFAULT_CONFIGS:

        exists = (
            db.query(AppConfig)
            .filter(AppConfig.config_key == config["config_key"])
            .first()
        )

        if not exists:

            db.add(AppConfig(**config))

    db.commit()
