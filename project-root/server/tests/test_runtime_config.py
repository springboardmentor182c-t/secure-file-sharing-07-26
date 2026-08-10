import pytest

from src.config import (
    DATA_DIR,
    KEYS_DIR,
    MASTER_KEY_FILE,
    UPLOADS_DIR,
    backend_url,
    cors_origins,
    frontend_url,
)
from src.security.key_manager import KEYS_DIR as ACTIVE_KEYS_DIR
from src.security.master_key import MASTER_KEY_FILE as ACTIVE_MASTER_KEY_FILE
from src.security.secure_storage import STORAGE_DIR


@pytest.mark.parametrize(
    ("variable_name", "loader"),
    (("FRONTEND_URL", frontend_url), ("BACKEND_URL", backend_url)),
)
def test_public_urls_are_required_environment_values(monkeypatch, variable_name, loader):
    monkeypatch.delenv(variable_name, raising=False)

    with pytest.raises(RuntimeError, match=variable_name):
        loader()

    monkeypatch.setenv(variable_name, "https://configured.example/")
    assert loader() == "https://configured.example"


def test_cors_origins_are_loaded_from_environment(monkeypatch):
    monkeypatch.delenv("BACKEND_CORS_ORIGINS", raising=False)

    with pytest.raises(RuntimeError, match="BACKEND_CORS_ORIGINS"):
        cors_origins()

    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "https://one.example/, https://two.example",
    )
    assert cors_origins() == ["https://one.example", "https://two.example"]


def test_encrypted_storage_paths_follow_data_dir():
    assert KEYS_DIR == DATA_DIR / "keys"
    assert UPLOADS_DIR == DATA_DIR / "uploads"
    assert MASTER_KEY_FILE == DATA_DIR / "master.key"
    assert ACTIVE_KEYS_DIR == KEYS_DIR
    assert STORAGE_DIR == UPLOADS_DIR
    assert ACTIVE_MASTER_KEY_FILE == MASTER_KEY_FILE
