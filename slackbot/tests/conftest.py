import os

# Mock environment variables before any imports
# This ensures that config.py can be imported without errors
os.environ.setdefault("slack_app_token", "test-app-token")
os.environ.setdefault("slack_bot_token", "test-bot-token")
