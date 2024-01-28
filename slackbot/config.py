import os


def get_secret(name: str) -> str:
    existing = os.getenv("pihole_api_token")
    if existing:
        return existing

    secret_path = f"/run/secrets/{name}"
    if os.path.exists(secret_path):
        with open(secret_path) as f:
            secret = f.readline().strip("\n")

        if secret is not None and secret != "":
            return secret

    raise KeyError(name)


def get_env(name: str) -> str:
    env_var = os.getenv(name)
    if env_var is None:
        raise KeyError(name)

    return env_var


class Settings:
    SLACK_APP_TOKEN = get_secret("slack_app_token")
    SLACK_BOT_TOKEN = get_secret("slack_bot_token")
