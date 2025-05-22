#!/bin/bash

set -e  # Exit if any command fails

# Navigate to the backend directory and start the FastAPI server
cd ChatBotAPI
echo "Starting backend..."
python3 -m uvicorn main:app --reload &

# Navigate to the frontend directory and start the React development server
cd ../chatbot-app
echo "Installing frontend dependencies..."
npm install

echo "Starting React frontend..."
npm start &

# Wait for all background processes to finish
wait
