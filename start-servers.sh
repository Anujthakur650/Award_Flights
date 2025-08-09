#!/bin/bash

echo "🚀 Starting AeroPoints Application..."
echo ""

# Start backend server
echo "📦 Starting Backend Server..."
cd backend
node server.js &
BACKEND_PID=$!
echo "✅ Backend running on http://localhost:5000 (PID: $BACKEND_PID)"
echo ""

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "🎨 Starting Frontend Server..."
cd ../frontend
npm run dev &
FRONTEND_PID=$!
echo "✅ Frontend will be available on http://localhost:3001"
echo ""

echo "========================================="
echo "🎉 AeroPoints is running!"
echo "Frontend: http://localhost:3001"
echo "Backend API: http://localhost:5000/api"
echo "========================================="
echo ""
echo "Press Ctrl+C to stop both servers..."

# Wait for user to press Ctrl+C
trap "echo ''; echo '🛑 Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Keep script running
while true; do
    sleep 1
done
