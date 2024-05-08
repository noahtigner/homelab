import os


def get_secret(name: str) -> str:
    existing = os.getenv(name)
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
    PIHOLE_IP = get_env("PIHOLE_IP")
    SERVER_IP = get_env("SERVER_IP")
    PIHOLE_API_BASE = f"http://{PIHOLE_IP}/admin"
    PIHOLE_API_TOKEN = get_secret("pihole_api_token")
    LEETCODE_USERNAME = get_env("LEETCODE_USERNAME")
    GITHUB_USERNAME = get_env("GITHUB_USERNAME")
    OGP_IO_API_KEY = get_env("OGP_IO_API_KEY")
    GA4_PROPERTY_ID = get_env("GA4_PROPERTY_ID")
    GA4_CREDENTIALS = get_secret("ga4_credentials")
