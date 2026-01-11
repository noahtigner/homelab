import sys
from pathlib import Path

# The api_diagnostics directory is mounted as "api" in Docker
# We need to ensure that "api.config" resolves to the LOCAL config.py,
# not the parent /api directory

api_diagnostics_dir = Path(__file__).parent.parent

# Remove the grandparent directory from sys.path if it's there
# This prevents importing from the parent /api directory
grandparent_dir = str(api_diagnostics_dir.parent)
if grandparent_dir in sys.path:
    sys.path.remove(grandparent_dir)

# Add api_diagnostics directory at the beginning
sys.path.insert(0, str(api_diagnostics_dir))
