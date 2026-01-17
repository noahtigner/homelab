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
    SERVER_IP = get_env("SERVER_IP")
    PIHOLE_API_BASE = f"https://{SERVER_IP}"
    PIHOLE_API_PASSWORD = get_secret("pihole_password")
    LEETCODE_USERNAME = get_env("LEETCODE_USERNAME")
    GITHUB_USERNAME = get_env("GITHUB_USERNAME")
    OGP_IO_API_KEY = get_env("OGP_IO_API_KEY")
    GA4_PROPERTY_ID = get_env("GA4_PROPERTY_ID")
    GA4_CREDENTIALS = get_secret("ga4_credentials")
    NAS_API_USERNAME = get_env("NAS_API_USERNAME")
    NAS_API_PASSWORD = get_env("NAS_API_PASSWORD")
    NAS_API_BASE = f"https://{get_env('NAS_IP')}:{get_env('NAS_PORT')}/webapi/entry.cgi"
    MONARCHMONEY_API_TOKEN = get_secret("monarchmoney_token")
    PLEX_API_TOKEN = get_secret("plex_token")
