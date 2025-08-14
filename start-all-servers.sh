#!/bin/bash

# AeroPoints - Start All Servers Script
# This script starts both the backend (Node.js) and frontend (Next.js) servers

echo "🚀 Starting AeroPoints Servers..."
echo "=================================="

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "server-fixed" 2>/dev/null || true
pkill -f "server-enhanced" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 2

# Start Backend Server
echo "🖥️  Starting Backend Server (Port 5001)..."
cd backend
PORT=5001 nohup node server-fixed.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 3

# Check if backend is running
if curl -s http://localhost:5001/api/health > /dev/null; then
    echo "   ✅ Backend server is running on http://localhost:5001"
else
    echo "   ❌ Backend server failed to start"
    exit 1
fi

# Start Frontend Server  
echo "🌐 Starting Frontend Server (Port 3000)..."
cd ../frontend
# Prevent backend PORT from leaking into Next.js
unset PORT
nohup npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "   Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
echo "⏳ Waiting for frontend to start..."
sleep 8

# Check if frontend is running
if curl -s http://localhost:3000 > /dev/null; then
    echo "   ✅ Frontend server is running on http://localhost:3000"
else
    echo "   ⚠️  Frontend server is still starting..."
fi

echo ""
echo "🎉 AeroPoints Servers Started!"
echo "=================================="
echo "🖥️  Backend:  http://localhost:5001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "📋 Process IDs:"
echo "   Backend:  $BACKEND_PID"
echo "   Frontend: $FRONTEND_PID"
echo ""
echo "📁 Logs:"
echo "   Backend:  logs/backend.log"
echo "   Frontend: logs/frontend.log"
echo ""
echo "🛑 To stop servers: pkill -f \"server-fixed\" && pkill -f \"next-server\""
echo ""
echo "✨ Ready to search flights!"
