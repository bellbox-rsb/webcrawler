import sys
import os

# Add the backend directory to sys.path so we can import from 'app'
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'backend'))
sys.path.append(backend_path)

from app import create_app

# Vercel's Python runtime expects 'app' to be the Flask instance
app = create_app()

# Optional: Add a request logger or other Vercel-specific logic here if needed
