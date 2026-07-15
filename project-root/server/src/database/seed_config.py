from sqlalchemy.orm import Session

from src.entities.app_config import AppConfig


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
    {
        "config_key": "ALLOWED_EXTENSIONS",
        "config_value": ".pdf,.doc,.docx,.txt,.csv,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.zip,.rar",
        "description": "Allowed upload file extensions",
    },
    {
        "config_key": "ALLOWED_MIME_TYPES",
        "config_value": ",".join([
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "image/jpeg",
            "image/png",
            "image/gif",
            "application/zip",
            "application/x-rar-compressed",
            "application/octet-stream",
        ]),
        "description": "Allowed upload MIME types",
    },
]


def seed_configs(db: Session):

    for config in DEFAULT_CONFIGS:

        exists = (
            db.query(AppConfig)
            .filter(
                AppConfig.config_key == config["config_key"]
            )
            .first()
        )

        if not exists:

            db.add(AppConfig(**config))

    db.commit()