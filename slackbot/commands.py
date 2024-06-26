from datetime import datetime

import requests


def get_time() -> str:
    return f"\nIt is currently {datetime.now().strftime('%H:%M:%S')}"


def get_service_statuses() -> str:
    yield "Checking services..."

    services = [
        ["docker", ["docker", "api", "slackbot"]],
        ["pihole", ["pihole"]],
        ["docker/container/reverse_proxy", ["reverse_proxy"]],
        ["docker/container/dashboard", ["dashboard"]],
        ["cache", ["cache"]],
    ]

    for path, names in services:
        url = f"http://api:8000/{path}/"
        try:
            response = requests.get(url)
            if response.status_code == 200:
                for name in names:
                    yield f":white_check_mark: *{name}* is running"
            else:
                error_message = response.json().get("detail", "No detail provided")
                for name in names:
                    yield f":warning: *{name}* is not running or did not respond: `{error_message}`"
        except Exception as e:
            for name in names:
                yield f":warning: *{name}* is not running or did not respond: `{e}`"
