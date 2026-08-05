from fastapi import FastAPI

from src.api import register_routes


def test_register_routes_imports_without_error():
    app = FastAPI()
    register_routes(app)

    assert any(route.path == "/shared-links" for route in app.routes)
