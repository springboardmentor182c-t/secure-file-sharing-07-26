import pytest

from src.config import backend_url, cors_origins, frontend_url


@pytest.mark.parametrize(
    ("variable_name", "loader"),
    (("FRONTEND_URL", frontend_url), ("BACKEND_URL", backend_url)),
)
def test_public_urls_are_required_environment_values(monkeypatch, variable_name, loader):
    monkeypatch.delenv(variable_name, raising=False)
    monkeypatch.delenv("RENDER_EXTERNAL_URL", raising=False)

    with pytest.raises(RuntimeError, match=variable_name):
        loader()

    monkeypatch.setenv("RENDER_EXTERNAL_URL", "https://render.example/")
    assert loader() == "https://render.example"

    monkeypatch.setenv(variable_name, "https://configured.example/")
    assert loader() == "https://configured.example"


def test_cors_origins_are_loaded_from_environment(monkeypatch):
    monkeypatch.delenv("BACKEND_CORS_ORIGINS", raising=False)
    monkeypatch.setenv("FRONTEND_URL", "https://frontend.example/")

    assert cors_origins() == ["https://frontend.example"]

    monkeypatch.setenv(
        "BACKEND_CORS_ORIGINS",
        "https://one.example/, https://two.example",
    )
    assert cors_origins() == ["https://one.example", "https://two.example"]
