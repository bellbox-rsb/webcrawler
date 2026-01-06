from flask import Flask
from flask_cors import CORS
import os

def create_app():
    app = Flask(__name__)
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

    # Register Blueprints or Routes
    from app.routes import main
    app.register_blueprint(main)

    return app
