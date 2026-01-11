from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient

from api.main import api


@pytest.fixture
def client():
    """Create a test client for the API"""
    return TestClient(api)


class TestMainEndpoints:
    """Test main API endpoints"""

    def test_get_server_health(self, client):
        """Test the health check endpoint"""
        response = client.get("/")

        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "root_path" in data
