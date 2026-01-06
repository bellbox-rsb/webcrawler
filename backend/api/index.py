from app import create_app

app = create_app()

# This is required for Vercel to find the app
from app.routes import main
app.register_blueprint(main)

# Note: The above might be redundant if create_app already handles it, 
# but we want to ensure the app object is available as 'app'.
