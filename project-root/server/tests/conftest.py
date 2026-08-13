import sys
from pathlib import Path

# Add project root server directory to sys.path so `src` can be imported
server_dir = Path(__file__).resolve().parent.parent
if str(server_dir) not in sys.path:
    sys.path.insert(0, str(server_dir))
