#!/bin/bash

set -e  # Exit on error
set -o pipefail

# Start backend
if [ -d "ChatBotAPI" ]; then
  cd ChatBotAPI
  echo "📦 Starting FastAPI backend..."
  nohup python3 -m uvicorn main:app --reload > ../backend.log 2>&1 &
  cd ..
else
  echo "❌ ChatBotAPI directory not found!"
  exit 1
fi

# Start frontend
if [ -d "chatbot-app" ]; then
  cd chatbot-app
  echo "📦 Installing frontend dependencies..."
  npm install
  echo "💻 Starting React frontend..."
  nohup npm start > ../frontend.log 2>&1 &
  cd ..
else
  echo "❌ chatbot-app directory not found!"
  exit 1
fi

echo "✅ Both backend and frontend are running. Logs saved to backend.log and frontend.log."
