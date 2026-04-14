#!/bin/bash

# Skill Normalization Service Startup Script (Unix/Mac)

set -e  # Exit on error

echo "Starting Skill Normalization Service..."

# Check Python version
python_version=$(python3 --version 2>&1 | awk '{print $2}')
echo "✓ Using Python $python_version"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Check if data files exist
if [ ! -f "data/skills.json" ]; then
    echo "✗ Error: data/skills.json not found"
    exit 1
fi

if [ ! -f "data/rules.json" ]; then
    echo "✗ Error: data/rules.json not found"
    exit 1
fi

echo "✓ Data files found"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
fi

echo "✓ Configuration loaded"

# Start service
PORT=${SERVICE_PORT:-8003}
echo "Starting service on port $PORT..."
echo "Access API at: http://localhost:$PORT"
echo "Interactive docs at: http://localhost:$PORT/docs"
echo "Press CTRL+C to stop"
echo ""

uvicorn main:app --host 0.0.0.0 --port $PORT --reload
