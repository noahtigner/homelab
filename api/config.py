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
    PIHOLE_API_BASE = get_env("PIHOLE_API_BASE")
    PIHOLE_API_TOKEN = get_secret("pihole_api_token")
    LEETCODE_USERNAME = get_env("LEETCODE_USERNAME")
    GITHUB_USERNAME = get_env("GITHUB_USERNAME")
    OGP_IO_API_KEY = get_env("OGP_IO_API_KEY")
