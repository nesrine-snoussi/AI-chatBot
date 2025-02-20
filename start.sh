#!/bin/bash

# Navigate to the backend directory and start the FastAPI server
cd ChatBotAPI
echo "Starting backend..."
python -m uvicorn main:app --reload &

# Navigate to the frontend directory and start the React development server
cd ../chatbot-app
echo "Starting React frontend..."
npm start &

# Wait for all background processes to finish
wait
