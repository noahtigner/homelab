import json
from datetime import datetime

import requests


def get_time() -> str:
    return f"\nIt is currently {datetime.now().strftime('%H:%M:%S')}"


def get_docker_stats() -> str:
    yield "Fetching Docker stats..."
    url = "http://api:8000/docker/stats/"
    try:
        response = requests.get(url)
        if response.status_code == 200:
            yield json.dumps(response.json())
        else:
            error_message = response.json().get("detail", "No detail provided")
            yield f"Request failed with status code {response.status_code}: {error_message}"
    except Exception as e:
        yield f"Request failed with exception {e}"
