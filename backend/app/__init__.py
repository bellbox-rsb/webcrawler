from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5000"]}}, supports_credentials=True)

    # Register Blueprints or Routes
    from app.routes import main
    app.register_blueprint(main)

    return app
