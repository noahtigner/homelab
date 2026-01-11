import os

# Mock all required environment variables before any imports
os.environ.setdefault("SERVER_IP", "127.0.0.1")
os.environ.setdefault("GITHUB_USERNAME", "testuser")
os.environ.setdefault("LEETCODE_USERNAME", "testuser")
os.environ.setdefault("OGP_IO_API_KEY", "test-api-key")
os.environ.setdefault("GA4_PROPERTY_ID", "123456789")
os.environ.setdefault("NAS_API_USERNAME", "testuser")
os.environ.setdefault("NAS_API_PASSWORD", "testpass")
os.environ.setdefault("NAS_IP", "192.168.1.1")
os.environ.setdefault("NAS_PORT", "5001")
os.environ.setdefault("pihole_password", "testpass")
os.environ.setdefault("ga4_credentials", "{}")
os.environ.setdefault("monarchmoney_token", "test-token")
