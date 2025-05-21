# Stage 1: Build React frontend
FROM node:16-alpine as frontend-build

WORKDIR /app/chatbot-app

COPY chatbot-app/package.json chatbot-app/package-lock.json ./
RUN npm install

COPY chatbot-app/ ./
RUN npm run build

# Stage 2: Build FastAPI backend image
FROM python:3.9-slim

WORKDIR /app

# Copy backend code
COPY ChatBotAPI/ ./ChatBotAPI

# Copy React build from frontend-build stage to backend static folder
COPY --from=frontend-build /app/chatbot-app/build ./ChatBotAPI/static

# Install backend dependencies
RUN pip install --no-cache-dir fastapi uvicorn requests pydantic

# Expose port
EXPOSE 5000

# Set environment variable for FastAPI port
ENV PORT=5000

# Run FastAPI app with uvicorn
CMD ["uvicorn", "ChatBotAPI.main:app", "--host", "0.0.0.0", "--port", "5000"]
