#!/bin/bash

# AeroPoints - Start All Servers Script
# This script starts both the backend (Node.js) and frontend (Next.js) servers

echo "🚀 Starting AeroPoints Servers..."
echo "=================================="

# Resolve project root regardless of current working directory
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$ROOT_DIR/logs"

# Load backend environment variables if present (for SEATS_AERO_API_KEY, etc.)
if [ -f "$ROOT_DIR/backend/.env" ]; then
  echo "🔐 Loading backend environment from backend/.env"
  set -a
  . "$ROOT_DIR/backend/.env"
  set +a
fi

# Kill any existing processes
echo "🔄 Cleaning up existing processes..."
pkill -f "server-fixed" 2>/dev/null || true
pkill -f "server-enhanced" 2>/dev/null || true
pkill -f "next dev" 2>/dev/null || true
pkill -f "next-server" 2>/dev/null || true
sleep 2

# Start Backend Server
echo "🖥️  Starting Backend Server (Port 5001)..."
cd "$ROOT_DIR/backend" || { echo "❌ Could not cd to $ROOT_DIR/backend"; exit 1; }

# Choose backend implementation based on Seats.aero API key availability
if [ -n "$SEATS_AERO_API_KEY" ]; then
    echo "   🔐 Using Seats.aero live backend (server-fixed.js)"
    PORT=5001 nohup node server-fixed.js > "$ROOT_DIR/logs/backend.log" 2>&1 &
else
    echo "   🧪 Using mock/enhanced backend (server-enhanced.js) - no SEATS_AERO_API_KEY set"
    PORT=5001 nohup node server-enhanced.js > "$ROOT_DIR/logs/backend.log" 2>&1 &
fi
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
cd "$ROOT_DIR/frontend" || { echo "❌ Could not cd to $ROOT_DIR/frontend"; exit 1; }
# Ensure frontend does not inherit backend PORT (which Next.js uses if set)
unset PORT
nohup npm run dev > "$ROOT_DIR/logs/frontend.log" 2>&1 &
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
echo "🛑 To stop servers: pkill -f \"server-fixed\" || true; pkill -f \"server-enhanced\" || true; pkill -f \"next-server\" || true"
echo ""
echo "✨ Ready to search flights!"
