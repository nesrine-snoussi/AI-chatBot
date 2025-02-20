import uuid
import json
import requests
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from pydantic import BaseModel
from typing import Dict, List

app = FastAPI()

# Groq API key
api_key = "your_api_key_here"

# Set up the Groq API URL
url = "https://api.groq.com/openai/v1/chat/completions"

# In-memory store for chat history
chat_sessions: Dict[str, List[Dict[str, str]]] = {}

# Active WebSocket connections
active_connections: Dict[str, WebSocket] = {}

# Define the system prompt
system_prompt = {"role": "system", "content": "You are a helpful assistant."}

class UserInput(BaseModel):
    user_input: str
    session_id: str  # Identifiant de session


@app.post("/chat")
async def chat(user_input: UserInput):
    session_id = user_input.session_id

    if session_id not in chat_sessions:
        chat_sessions[session_id] = [system_prompt]

    chat_sessions[session_id].append({"role": "user", "content": user_input.user_input})

    payload = {
        "model": "llama3-70b-8192",
        "messages": chat_sessions[session_id],
        "max_tokens": 100,
        "temperature": 1.2
    }

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    response = requests.post(url, headers=headers, data=json.dumps(payload))

    if response.status_code == 200:
        response_data = response.json()
        assistant_reply = response_data['choices'][0]['message']['content']
        chat_sessions[session_id].append({"role": "assistant", "content": assistant_reply})
        return {"assistant_reply": assistant_reply}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)


@app.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    if session_id not in chat_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"session_id": session_id, "chat_history": chat_sessions[session_id]}


@app.websocket("/ws/chat/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """ WebSocket to handle AI responses in real-time """
    await websocket.accept()

    if session_id not in chat_sessions:
        chat_sessions[session_id] = [system_prompt]

    try:
        while True:
            # Receive a message from the frontend
            data = await websocket.receive_text()
            chat_sessions[session_id].append({"role": "user", "content": data})

            payload = {
                "model": "llama3-70b-8192",
                "messages": chat_sessions[session_id],
                "max_tokens": 100,
                "temperature": 1.2,
                "stream": True  # Streaming enabled
            }
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }

            response = requests.post(url, headers=headers, data=json.dumps(payload), stream=True)

            if response.status_code == 200:
                full_reply = ""
                for chunk in response.iter_lines():
                    if chunk:
                        chunk_str = chunk.decode("utf-8").strip()  # Clean the chunk
                        print(f"Received chunk: {chunk_str}")  # Debug log

                        # Check and remove the "data: " prefix if present
                        if chunk_str.startswith("data: "):
                            chunk_str = chunk_str[len("data: "):].strip()

                        if not chunk_str:  # Check if the chunk is empty after cleaning
                            print("⚠️ Empty chunk received, ignored.")
                            continue

                        try:
                            chunk_data = json.loads(chunk_str)  # Convert to JSON
                            if "choices" in chunk_data and chunk_data["choices"]:
                                delta = chunk_data["choices"][0].get("delta", {})
                                content = delta.get("content", "")

                                if content:  # Avoid sending empty messages
                                    full_reply += content
                        except json.JSONDecodeError as e:
                            print(f"⚠️ JSON decoding error: {e} - Problematic chunk: {chunk_str}")
                            continue  # Ignore the problematic chunk

                chat_sessions[session_id].append({"role": "assistant", "content": full_reply})
                await websocket.send_text(full_reply)

            else:
                await websocket.send_text(f"Error: {response.status_code} - {response.text}")

    except WebSocketDisconnect:
        del chat_sessions[session_id]




def get_session_id():
    session_id = str(uuid.uuid4())
    print(f"New session ID: {session_id}")
    return session_id


get_session_id()
