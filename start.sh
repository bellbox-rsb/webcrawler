#!/bin/bash

# Function to kill child processes on exit
cleanup() {
    echo "Stopping services..."
    kill $(jobs -p) 2>/dev/null
}
trap cleanup SIGINT SIGTERM EXIT

if command -v docker &> /dev/null; then
    echo "🐳 Docker found. Starting with Docker Compose..."
    echo "Backend: http://localhost:5001"
    echo "Frontend: http://localhost:5173"
    docker compose up --build
else
    echo "⚠️ Docker not found. Starting in MANUAL mode..."
    
    echo "📦 Starting Backend (Flask)..."
    cd backend
    # Try to install reqs quietly, proceed if fails (might be already installed or system python)
    pip install -r requirements.txt > /dev/null 2>&1
    export FLASK_APP=run.py
    export FLASK_ENV=development
    # export FLASK_DEBUG=1
    # flask run --host=0.0.0.0 --port=5000 &
    export PORT=5000
    python3 run.py &
    BACKEND_PID=$!
    cd ..

    echo "🎨 Starting Frontend (Vite)..."
    cd frontend
    # Try to install deps quietly
    npm install > /dev/null 2>&1
    npm run dev -- --host &
    FRONTEND_PID=$!
    cd ..

    echo "✅ Services Started!"
    echo "   Backend: http://localhost:5000"
    echo "   Frontend: http://localhost:5173"
    echo "   Press Ctrl+C to stop."

    wait $BACKEND_PID $FRONTEND_PID
fi
