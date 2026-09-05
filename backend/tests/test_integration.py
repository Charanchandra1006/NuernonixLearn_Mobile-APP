import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_auth_login_validation():
    # Should fail if no form data provided
    response = client.post("/api/v1/login/access-token")
    assert response.status_code == 422

# Note: In a real e2e test, we'd mock the DB and create a user, 
# then generate a token and test the authenticated ML endpoint handoffs.
