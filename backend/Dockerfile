FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system dependencies if needed (e.g. for build tools)
# RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 5000

# Production configuration
# ENV FLASK_DEBUG=1

# Use gunicorn for production
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "run:app"]
