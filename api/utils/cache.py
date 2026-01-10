import json
import logging
from functools import wraps
from typing import Callable

from fastapi import Depends, Request
from pydantic import BaseModel, ValidationError

logger = logging.getLogger(__name__)


def cache(key: str, response_model: BaseModel, ttl: int = 3600):
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(request: Request = Depends(), *args, **kwargs):
            cache_key = f"{key}:{json.dumps(args)}:{json.dumps(kwargs)}"

            # Try to get the result from cache
            cached_result = await request.app.state.redis.get(cache_key)
            if cached_result is not None:
                logger.info("Cache hit")
                try:
                    return response_model(**json.loads(cached_result))
                except ValidationError as e:
                    # Cache miss, delete the key
                    logger.warning(f"Error parsing cache result: {e}")
                    await request.app.state.redis.delete(cache_key)

            # Call the original function
            result = await func(request=request, *args, **kwargs)

            # Cache the result
            await request.app.state.redis.set(cache_key, result.model_dump_json(), ex=ttl)
            return result

        return wrapper

    return decorator
