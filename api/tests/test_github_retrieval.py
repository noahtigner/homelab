from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import requests
from fastapi import HTTPException

from api.github.models import EventsResponseModel
from api.github.retrieval import retrieve_events


@pytest.mark.asyncio
class TestGitHubRetrieval:
    """Test GitHub retrieval functions"""

    @patch("api.github.retrieval.requests.get")
    async def test_retrieve_events_success(self, mock_get):
        """Test successful retrieval of GitHub events"""
        # Mock response
        mock_response = MagicMock()
        mock_response.json.return_value = [
            {
                "id": "123",
                "type": "PushEvent",
                "repo": {
                    "id": 456,
                    "name": "test/repo",
                    "url": "https://api.github.com/repos/test/repo",
                },
                "payload": {"commits": [{"sha": "abc123"}, {"sha": "def456"}]},
                "created_at": "2024-01-01T12:00:00Z",
            }
        ]
        mock_get.return_value = mock_response

        # Mock request with redis
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        # Call function
        result = await retrieve_events(mock_request)

        # Verify result - the function calls the API 3 times for 3 pages
        assert isinstance(result, EventsResponseModel)
        assert len(result.events) == 3  # Called 3 times, one event per call
        assert result.events[0].type == "PushEvent"
        assert result.events[0].commits == 2

    @patch("api.github.retrieval.requests.get")
    async def test_retrieve_events_rate_limit(self, mock_get):
        """Test handling of GitHub API rate limit"""
        # Mock rate limit response
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "message": "API rate limit exceeded for user"
        }
        mock_get.return_value = mock_response

        # Mock request
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        # Call function and expect exception
        with pytest.raises(HTTPException) as exc_info:
            await retrieve_events(mock_request)

        assert exc_info.value.status_code == 503
        assert "Rate Limit" in exc_info.value.detail

    @patch("api.github.retrieval.requests.get")
    async def test_retrieve_events_connection_error(self, mock_get):
        """Test handling of connection errors"""
        # Mock connection error
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")

        # Mock request
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        # Call function and expect exception
        with pytest.raises(HTTPException) as exc_info:
            await retrieve_events(mock_request)

        assert exc_info.value.status_code == 503
        assert "Connection" in exc_info.value.detail
