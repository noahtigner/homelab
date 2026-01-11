import json
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import Request
from pydantic import BaseModel

from api.utils.cache import cache


class SampleModel(BaseModel):
    """Sample model for testing"""

    value: str
    count: int


@pytest.mark.asyncio
class TestCacheDecorator:
    """Test the cache decorator functionality"""

    async def test_cache_miss_and_set(self):
        """Test cache miss results in function call and cache set"""
        # Create a mock request with redis
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock(spec=Request)
        mock_request.app.state.redis = mock_redis

        # Create a decorated function
        @cache("test:key", SampleModel, ttl=60)
        async def test_func(request: Request):
            return SampleModel(value="test", count=42)

        result = await test_func(request=mock_request)

        # Verify the result
        assert isinstance(result, SampleModel)
        assert result.value == "test"
        assert result.count == 42

        # Verify cache operations
        mock_redis.get.assert_called_once()
        mock_redis.set.assert_called_once()

    async def test_cache_hit(self):
        """Test cache hit returns cached data without function call"""
        cached_data = json.dumps({"value": "cached", "count": 123})

        mock_redis = AsyncMock()
        mock_redis.get.return_value = cached_data

        mock_request = MagicMock(spec=Request)
        mock_request.app.state.redis = mock_redis

        # Track if the function was called
        function_called = False

        @cache("test:key", SampleModel, ttl=60)
        async def test_func(request: Request):
            nonlocal function_called
            function_called = True
            return SampleModel(value="fresh", count=999)

        result = await test_func(request=mock_request)

        # Verify cached result was returned
        assert isinstance(result, SampleModel)
        assert result.value == "cached"
        assert result.count == 123

        # Verify function was not called
        assert function_called is False

        # Verify cache operations
        mock_redis.get.assert_called_once()
        mock_redis.set.assert_not_called()

    async def test_cache_invalid_data_deletes_and_refetches(self):
        """Test that invalid cached data is deleted and refetched"""
        invalid_cached_data = json.dumps({"invalid": "data"})

        mock_redis = AsyncMock()
        mock_redis.get.return_value = invalid_cached_data

        mock_request = MagicMock(spec=Request)
        mock_request.app.state.redis = mock_redis

        @cache("test:key", SampleModel, ttl=60)
        async def test_func(request: Request):
            return SampleModel(value="fresh", count=42)

        result = await test_func(request=mock_request)

        # Verify fresh result was returned
        assert isinstance(result, SampleModel)
        assert result.value == "fresh"
        assert result.count == 42

        # Verify cache operations
        mock_redis.get.assert_called_once()
        mock_redis.delete.assert_called_once()
        mock_redis.set.assert_called_once()

    async def test_cache_with_args_and_kwargs(self):
        """Test cache key includes args and kwargs"""
        mock_redis = AsyncMock()
        mock_redis.get.return_value = None

        mock_request = MagicMock(spec=Request)
        mock_request.app.state.redis = mock_redis

        @cache("test:key", SampleModel, ttl=60)
        async def test_func(request: Request, arg1: str, kwarg1: int = 10):
            return SampleModel(value=arg1, count=kwarg1)

        result = await test_func(request=mock_request, arg1="test", kwarg1=20)

        # Verify the result
        assert result.value == "test"
        assert result.count == 20

        # Verify cache key includes args and kwargs
        call_args = mock_redis.get.call_args[0][0]
        assert "test:key" in call_args
        assert '"test"' in call_args or "test" in call_args
        assert "20" in call_args
