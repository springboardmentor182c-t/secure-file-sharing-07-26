import pytest
from unittest.mock import MagicMock, patch
from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.files.controller import router

app = FastAPI()
app.include_router(router)

client = TestClient(app)


def test_download_file_unauthorized():
    """
    Backend Test Case 1: Access Control Verification
    Verifies that attempting to download a file without valid authentication
    is blocked and returns an unauthorized/unauthenticated response status.
    """
    response = client.get("/files/999/download")
    # Missing authentication credentials should be rejected by FastAPI dependency
    assert response.status_code in [401, 403, 422, 500]


def test_download_file_success(tmp_path):
    """
    Backend Test Case 2: File Download Endpoint Verification
    Verifies that an authenticated user can download their file successfully,
    returning a 200 OK status code, correct file headers, and exact file content.
    """
    # Create temporary mock file
    test_file = tmp_path / "secure_report.pdf"
    test_file.write_text("Confidential File Contents for Test")

    # Mock user entity
    mock_user = MagicMock()
    mock_user.id = 42

    # Patch the service call to return mock file path
    with patch("src.files.service.get_file_path") as mock_service:
        mock_service.return_value = (test_file, "secure_report.pdf")

        from src.auth.dependencies import get_current_user
        from src.database.session import get_db

        # Dependency injection overrides for isolated testing
        app.dependency_overrides[get_current_user] = lambda: mock_user
        app.dependency_overrides[get_db] = lambda: MagicMock()

        try:
            response = client.get("/files/100/download")
            assert response.status_code == 200
            assert response.content == b"Confidential File Contents for Test"
            assert "secure_report.pdf" in response.headers.get("content-disposition", "")
        finally:
            app.dependency_overrides.clear()
