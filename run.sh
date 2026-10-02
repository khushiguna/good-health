#!/usr/bin/env bash
# Good Health and Well-Being - Startup Runner Script

set -e

PORT=${PORT:-8080}
echo "=================================================================="
echo " 🌱 Launching Good Health and Well-Being Platform..."
echo "=================================================================="

# Check if a functioning Java runtime is available
if java -version >/dev/null 2>&1; then
    echo "☕ Detected active Java runtime. Starting Java server (HealthAppServer)..."
    java HealthAppServer.java
    exit 0
fi

# Fallback 1: Check if Node is available
if node -v >/dev/null 2>&1; then
    echo "🟢 Starting Node.js Express backend server (backend/server.js)..."
    node backend/server.js
    exit 0
fi

# Fallback 2: Check if Python 3 is available
if python3 -c 'import sys; print(sys.version)' >/dev/null 2>&1; then
    echo "🐍 Starting Python 3 web server on port $PORT..."
    python3 -m http.server "$PORT"
    exit 0
fi

echo "👉 Opening 'index.html' directly in your default browser..."
open index.html 2>/dev/null || xdg-open index.html 2>/dev/null || true
