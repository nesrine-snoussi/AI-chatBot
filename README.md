# AI Chatbot Project

This project integrates a FastAPI backend with a React frontend to create an AI-powered chatbot application. Follow the instructions below to set up and run the project.

## Project Structure

The project's directory structure is organized as follows:
- **ChatBotAPI/**: Contains the FastAPI application.
- **chatbot-app/**: Contains the React application.
- **start.sh**: Shell script to start both backend and frontend servers.
- **README.md**: This documentation file.

## Prerequisites

Ensure you have the following installed:

- **Python 3.8+**: Required for the FastAPI backend.
- **Node.js 14+**: Required for the React frontend.
- **npm 6+**: Node package manager for handling frontend dependencies.
- **pip**: Python package installer.

## Setup Instructions
Before launching the application, you need to configure your Groq API key in the backend. Follow these steps:

- **Navigate to the ChatBotAPI/main.py file**:
        Open the main.py file located in the ChatBotAPI directory.

-**Add your OpenAI API key**:

    Locate the section in main.py where the API key is required.
    Replace the placeholder or empty string with your actual OpenAI API key. For example:

api_key = "your_api_key_here"

## Start the application:

    Return to the root directory of the project where start.sh is located.
    Ensure start.sh has execute permissions:

chmod +x start.sh

Run the start.sh script to start both the backend and frontend servers:

./start.sh