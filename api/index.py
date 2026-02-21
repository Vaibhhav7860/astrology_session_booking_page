import sys
import os

# Ensure the backend directory is in the path so relative imports inside backend/ like `from core.db` work natively on Vercel
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from main import app
