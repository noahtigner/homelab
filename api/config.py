import os

def get_secret(name: str) -> str:
    existing = os.getenv('pihole_api_token')
    if existing:
        return existing
        
    secret_path = f'/run/secrets/{name}'
    if os.path.exists(secret_path):
        with open(secret_path) as f:
            secret = f.readline().strip('\n')
        
        if secret is not None and secret != '':
            return secret
    
    raise KeyError(name)

class Settings:
    PIHOLE_API_BASE = os.getenv('PIHOLE_API_BASE')
    PIHOLE_API_TOKEN = get_secret('pihole_api_token')
