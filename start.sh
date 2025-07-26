#!/bin/bash

echo "Starting AI Integrity Hub..."
echo

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo
echo "Installing Node.js dependencies..."
npm install

echo
echo "Starting Flask API server in background..."
cd api && python app.py &
API_PID=$!

echo
echo "Waiting for API to start..."
sleep 3

echo
echo "Starting React development server..."
npm run dev &
REACT_PID=$!

echo
echo "Both servers are starting..."
echo "Frontend: http://localhost:8080"
echo "Backend: http://localhost:5000"
echo
echo "Press Ctrl+C to stop both servers..."

# Wait for user to stop
trap "echo 'Stopping servers...'; kill $API_PID $REACT_PID; exit" INT
wait 