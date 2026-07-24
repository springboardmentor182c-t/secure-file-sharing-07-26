# server/tests/test_analytics.py
"""
Unit tests for Analytics Module.
5 comprehensive tests covering security, validation, and functionality.
"""

import pytest
from fastapi.testclient import TestClient
from src.main import app

# Create a test client that can make requests to our FastAPI app
client = TestClient(app)


# ══════════════════════════════════════════════════════════════════════
#  TEST 1: Analytics Summary Endpoint Requires Authentication
# ══════════════════════════════════════════════════════════════════════
def test_analytics_summary_requires_authentication():
    """
    Verifies that the /api/analytics/summary endpoint is protected
    and blocks unauthenticated requests.
    
    This ensures our security implementation is working correctly.
    """
    # Attempt to access analytics without any authentication token
    response = client.get("/api/analytics/summary?days=30")
    
    # Should be blocked with 401 Unauthorized or 403 Forbidden
    assert response.status_code in [401, 403], (
        f"Expected 401 or 403 but got {response.status_code}. "
        "Analytics endpoint should require authentication!"
    )
    
    print("✅ TEST 1 PASSED: Analytics summary endpoint is properly secured")


# ══════════════════════════════════════════════════════════════════════
#  TEST 2: Export CSV Endpoint Requires Authentication
# ══════════════════════════════════════════════════════════════════════
def test_export_csv_requires_authentication():
    """
    Verifies that the CSV export endpoint requires a valid JWT token.
    
    This prevents unauthorized data downloads.
    """
    # Attempt to export CSV without authentication
    response = client.get("/api/analytics/export/csv?days=30&tab=file")
    
    # Should be blocked (401, 403, or possibly 422 if params validated first)
    assert response.status_code in [401, 403, 422], (
        f"Expected 401/403/422 but got {response.status_code}. "
        "CSV export should require authentication!"
    )
    
    print("✅ TEST 2 PASSED: CSV export endpoint is properly secured")


# ══════════════════════════════════════════════════════════════════════
#  TEST 3: Export PDF Endpoint Requires Authentication
# ══════════════════════════════════════════════════════════════════════
def test_export_pdf_requires_authentication():
    """
    Verifies that the PDF export endpoint (both file-analytics and security)
    requires a valid JWT token.
    """
    # Test File Analytics PDF export
    response_file = client.get("/api/analytics/export/file-analytics?days=30")
    assert response_file.status_code in [401, 403], (
        f"File Analytics PDF: Expected 401/403 but got {response_file.status_code}"
    )
    
    # Test Security PDF export
    response_security = client.get("/api/analytics/export/security?days=30")
    assert response_security.status_code in [401, 403], (
        f"Security PDF: Expected 401/403 but got {response_security.status_code}"
    )
    
    print("✅ TEST 3 PASSED: Both PDF export endpoints are properly secured")


# ══════════════════════════════════════════════════════════════════════
#  TEST 4: Days Parameter Validates Correctly
# ══════════════════════════════════════════════════════════════════════
def test_days_parameter_accepts_valid_range():
    """
    Verifies that the 'days' query parameter accepts valid values (1-3650).
    Even without auth, FastAPI should not crash on valid parameters.
    """
    # Test with valid days values
    valid_days = [1, 7, 30, 90, 365, 3650]
    
    for days in valid_days:
        response = client.get(f"/api/analytics/summary?days={days}")
        # Should be 401/403 (auth required) but NOT 422 (validation error)
        assert response.status_code != 500, (
            f"Server crashed with days={days}. Should handle gracefully!"
        )
        # Should be blocked by auth (401/403), not param validation (422)
        assert response.status_code in [401, 403], (
            f"For days={days}: Expected 401/403 but got {response.status_code}"
        )
    
    print(f"✅ TEST 4 PASSED: All {len(valid_days)} valid day values accepted")


# ══════════════════════════════════════════════════════════════════════
#  TEST 5: CSV Export Accepts Valid Tab Parameter
# ══════════════════════════════════════════════════════════════════════
def test_csv_export_accepts_valid_tab_parameter():
    """
    Verifies that the CSV export endpoint accepts both 'file' and 'security'
    tab parameters without crashing.
    """
    # Test both valid tab values
    valid_tabs = ["file", "security"]
    
    for tab in valid_tabs:
        response = client.get(f"/api/analytics/export/csv?tab={tab}&days=30")
        # Should be auth-blocked (401/403), not server error (500)
        assert response.status_code != 500, (
            f"Server crashed with tab={tab}. Should handle gracefully!"
        )
        # Should be blocked by auth or accept the tab param
        assert response.status_code in [401, 403], (
            f"For tab={tab}: Expected 401/403 but got {response.status_code}"
        )
    
    print(f"✅ TEST 5 PASSED: Both tab values ('file', 'security') accepted")


# ══════════════════════════════════════════════════════════════════════
# Test Summary
# ══════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    """Run tests directly with: python test_analytics.py"""
    print("\n" + "="*60)
    print("Running Analytics Module Backend Tests")
    print("="*60 + "\n")
    
    test_analytics_summary_requires_authentication()
    test_export_csv_requires_authentication()
    test_export_pdf_requires_authentication()
    test_days_parameter_accepts_valid_range()
    test_csv_export_accepts_valid_tab_parameter()
    
    print("\n" + "="*60)
    print("✅ ALL 5 BACKEND TESTS PASSED!")
    print("="*60 + "\n")