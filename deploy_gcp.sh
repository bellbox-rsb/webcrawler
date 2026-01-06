#!/bin/bash

# Exit on error
set -e

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: 'gcloud' command not found."
    echo "Please install the Google Cloud SDK or use Google Cloud Shell."
    echo "See GCP_SETUP_GUIDE.md for instructions."
    exit 1
fi

PROJECT_ID=$(gcloud config get-value project)
REGION="us-central1"
BACKEND_SERVICE="webcrawler-backend"
FRONTEND_SERVICE="webcrawler-frontend"

echo "Deploying to Project: $PROJECT_ID in Region: $REGION"

# 1. Build and Submit Backend
echo "Building Backend..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$BACKEND_SERVICE ./backend --dockerfile backend/Dockerfile

# 2. Deploy Backend
echo "Deploying Backend..."
gcloud run deploy $BACKEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$BACKEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated

# Get Backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')
echo "Backend deployed at: $BACKEND_URL"

# 3. Build and Submit Frontend
# We need to pass the VITE_BACKEND_URL if we are doing build-time config,
# OR we rely on the frontend proxying.
# If the frontend is a pure SPA stored in Nginx, and it calls /api, Nginx must proxy.
# Let's assume we want Nginx to proxy /api to the backend.
# But we need to inject the backend URL into nginx.conf.

echo "Building Frontend..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/$FRONTEND_SERVICE ./frontend --dockerfile frontend/Dockerfile

# 4. Deploy Frontend
echo "Deploying Frontend..."
# We pass BACKEND_URL as an env var for Nginx (requires custom entrypoint)
gcloud run deploy $FRONTEND_SERVICE \
  --image gcr.io/$PROJECT_ID/$FRONTEND_SERVICE \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --set-env-vars BACKEND_URL=$BACKEND_URL

echo "Deployment Complete!"
echo "Frontend: $(gcloud run services describe $FRONTEND_SERVICE --platform managed --region $REGION --format 'value(status.url)')"
