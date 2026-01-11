import sys
from pathlib import Path

# The api_diagnostics code expects modules to be importable as "diagnostics" and "docker"
# We simply add the parent directory to sys.path to make this work
api_diagnostics_dir = Path(__file__).parent.parent
sys.path.insert(0, str(api_diagnostics_dir))
