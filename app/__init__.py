from flask import Flask
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'dev_secret_key')

    # Register Context Processors
    from .utils import get_tech_icon_url
    @app.context_processor
    def inject_icon_util():
        return dict(get_tech_icon_url=get_tech_icon_url)

    # Register Blueprints or Routes
    from app.routes import main
    app.register_blueprint(main)

    return app
