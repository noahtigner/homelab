from unittest.mock import AsyncMock, MagicMock, patch

import pytest
import requests
from fastapi import HTTPException

from api.plex.models import (
    PlexHealthResponse,
    PlexLibraryCountsResponse,
    PlexSessionsResponse,
)
from api.plex.retrieval import (
    retrieve_health,
    retrieve_library_counts,
    retrieve_sessions,
)


@pytest.mark.asyncio
class TestPlexHealthRetrieval:
    """Test Plex health retrieval functions"""

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_health_success(self, mock_get):
        """Test successful retrieval of Plex server health"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "MediaContainer": {
                "friendlyName": "My Plex Server",
                "version": "1.40.0.1234",
                "platform": "Linux",
                "platformVersion": "5.15.0",
                "claimed": True,
                "machineIdentifier": "abc123def456",
            }
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        result = await retrieve_health(mock_request)

        assert isinstance(result, PlexHealthResponse)
        assert result.friendly_name == "My Plex Server"
        assert result.version == "1.40.0.1234"
        assert result.platform == "Linux"
        assert result.claimed is True

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_health_connection_error(self, mock_get):
        """Test handling of connection errors for health check"""
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        with pytest.raises(HTTPException) as exc_info:
            await retrieve_health(mock_request)

        assert exc_info.value.status_code == 503
        assert "Connection" in exc_info.value.detail


@pytest.mark.asyncio
class TestPlexSessionsRetrieval:
    """Test Plex sessions retrieval functions"""

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_sessions_success(self, mock_get):
        """Test successful retrieval of active Plex sessions"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "MediaContainer": {
                "size": 1,
                "Metadata": [
                    {
                        "title": "The Matrix",
                        "type": "movie",
                        "year": 1999,
                        "duration": 8160000,
                        "viewOffset": 4080000,
                        "thumb": "/library/metadata/123/thumb",
                        "User": {"title": "johndoe"},
                        "Player": {
                            "title": "Living Room TV",
                            "platform": "Roku",
                            "product": "Plex for Roku",
                            "state": "playing",
                        },
                    }
                ],
            }
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        result = await retrieve_sessions(mock_request)

        assert isinstance(result, PlexSessionsResponse)
        assert result.count == 1
        assert len(result.sessions) == 1
        assert result.sessions[0].username == "johndoe"
        assert result.sessions[0].title == "The Matrix"
        assert result.sessions[0].media_type == "movie"
        assert result.sessions[0].player.title == "Living Room TV"
        assert result.sessions[0].progress_percent == 50.0

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_sessions_empty(self, mock_get):
        """Test retrieval when no active sessions"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "MediaContainer": {
                "size": 0,
            }
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        result = await retrieve_sessions(mock_request)

        assert isinstance(result, PlexSessionsResponse)
        assert result.count == 0
        assert len(result.sessions) == 0

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_sessions_episode(self, mock_get):
        """Test retrieval of TV episode session"""
        mock_response = MagicMock()
        mock_response.json.return_value = {
            "MediaContainer": {
                "size": 1,
                "Metadata": [
                    {
                        "title": "Pilot",
                        "type": "episode",
                        "grandparentTitle": "Breaking Bad",
                        "parentTitle": "Season 1",
                        "year": 2008,
                        "duration": 3480000,
                        "viewOffset": 1740000,
                        "User": {"title": "janedoe"},
                        "Player": {
                            "title": "iPhone",
                            "platform": "iOS",
                            "product": "Plex for iOS",
                            "state": "paused",
                        },
                    }
                ],
            }
        }
        mock_response.raise_for_status = MagicMock()
        mock_get.return_value = mock_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        result = await retrieve_sessions(mock_request)

        assert result.sessions[0].grandparent_title == "Breaking Bad"
        assert result.sessions[0].parent_title == "Season 1"
        assert result.sessions[0].player.state == "paused"

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_sessions_connection_error(self, mock_get):
        """Test handling of connection errors for sessions"""
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        with pytest.raises(HTTPException) as exc_info:
            await retrieve_sessions(mock_request)

        assert exc_info.value.status_code == 503


@pytest.mark.asyncio
class TestPlexLibraryCountsRetrieval:
    """Test Plex library counts retrieval functions"""

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_library_counts_success(self, mock_get):
        """Test successful retrieval of library counts"""

        def mock_get_response(url, **kwargs):
            mock_response = MagicMock()
            mock_response.raise_for_status = MagicMock()

            if "/library/sections" in url and "/all" not in url:
                # Main sections endpoint
                mock_response.json.return_value = {
                    "MediaContainer": {
                        "Directory": [
                            {"key": "1", "title": "Movies", "type": "movie"},
                            {"key": "2", "title": "TV Shows", "type": "show"},
                            {"key": "3", "title": "Music", "type": "artist"},
                        ]
                    }
                }
            elif "/library/sections/1/all" in url:
                mock_response.json.return_value = {"MediaContainer": {"totalSize": 150}}
            elif "/library/sections/2/all" in url:
                mock_response.json.return_value = {"MediaContainer": {"totalSize": 50}}
            elif "/library/sections/3/all" in url:
                mock_response.json.return_value = {
                    "MediaContainer": {"totalSize": 1000}
                }
            return mock_response

        mock_get.side_effect = mock_get_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        result = await retrieve_library_counts(mock_request)

        assert isinstance(result, PlexLibraryCountsResponse)
        assert result.total_items == 1200
        assert len(result.sections) == 3
        assert result.sections[0].title == "Movies"
        assert result.sections[0].count == 150
        assert result.sections[1].title == "TV Shows"
        assert result.sections[1].count == 50
        assert result.sections[2].title == "Music"
        assert result.sections[2].count == 1000

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_library_counts_connection_error(self, mock_get):
        """Test handling of connection errors for library counts"""
        mock_get.side_effect = requests.exceptions.ConnectionError("Connection refused")

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        with pytest.raises(HTTPException) as exc_info:
            await retrieve_library_counts(mock_request)

        assert exc_info.value.status_code == 503

    @patch("api.plex.retrieval.requests.get")
    async def test_retrieve_library_counts_http_error(self, mock_get):
        """Test handling of HTTP errors for library counts"""
        mock_response = MagicMock()
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError(
            "401 Unauthorized"
        )
        mock_get.return_value = mock_response

        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock()
        mock_request.app.state.redis = mock_redis

        with pytest.raises(HTTPException) as exc_info:
            await retrieve_library_counts(mock_request)

        assert exc_info.value.status_code == 502
