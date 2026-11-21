#!/usr/bin/env bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "=========================================================="
echo "  ACME Employee Salary Management - Startup Script"
echo "  Organization: 10,000 Employees across 5 Jurisdictions"
echo "  Backend: Ruby on Rails 8 API | Frontend: React 19 (Vite)"
echo "=========================================================="

# Resolve project root
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Source shell environment if rvm is used
if [ -f "$HOME/.rvm/scripts/rvm" ]; then
  source "$HOME/.rvm/scripts/rvm"
elif [ -f "$HOME/.zshrc" ]; then
  source "$HOME/.zshrc" 2>/dev/null || true
fi

cd "$PROJECT_ROOT/backend"
echo "-> Preparing Backend..."
bundle check || bundle install
bin/rails db:migrate

# Check if database has 10,000 employees; seed if empty
EMP_COUNT=$(bin/rails runner "puts Employee.count" 2>/dev/null || echo "0")
if [ "$EMP_COUNT" -lt 10000 ]; then
  echo "-> Database contains $EMP_COUNT employees. Seeding 10,000 realistic employees..."
  bin/rails db:seed
else
  echo "-> Database already verified with $EMP_COUNT employees."
fi

cd "$PROJECT_ROOT/frontend"
echo "-> Preparing Frontend..."
if [ ! -d "node_modules" ]; then
  npm install
fi

echo "----------------------------------------------------------"
echo "Starting Rails API (Port 3000) and Vite React (Port 5173)..."
echo "Press Ctrl+C to stop both servers."
echo "----------------------------------------------------------"

# Function to kill child processes on exit
cleanup() {
  echo ""
  echo "Shutting down servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# Start Rails server
cd "$PROJECT_ROOT/backend"
bin/rails server -p 3000 &
BACKEND_PID=$!

# Start Vite React server
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host &
FRONTEND_PID=$!

echo "=========================================================="
echo "  Portal ready!"
echo "  - Web App: http://localhost:5173"
echo "  - Rails API: http://localhost:3000/api/v1/analytics/overview"
echo "=========================================================="

wait
