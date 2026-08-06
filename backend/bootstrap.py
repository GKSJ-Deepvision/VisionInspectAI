from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent.parent
AI_SRC = ROOT / "AI" / "src"

if str(AI_SRC) not in sys.path:
    sys.path.insert(0, str(AI_SRC))