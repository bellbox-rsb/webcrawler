import os
import sys

# Add the parent directory to sys.path to ensure 'app' module can be found
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app

app = create_app()
