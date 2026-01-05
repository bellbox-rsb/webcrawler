FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies if needed (e.g. for build tools)
# RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Production configuration
# ENV FLASK_DEBUG=1

# Use gunicorn for production
# Gunicorn will bind to the port specified by the PORT environment variable.
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:$PORT run:app"]