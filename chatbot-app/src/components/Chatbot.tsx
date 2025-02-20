// src/components/Chatbot.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './Chatbot.css';

interface Message {
    role: string;
    content: string;
}

const Chatbot: React.FC = () => {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [userInput, setUserInput] = useState<string>('');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const generateSessionId = () => 'session_' + Math.random().toString(36).substring(7);
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        fetchChatHistory(newSessionId);

        const ws = new WebSocket(`ws://localhost:8000/ws/chat/${newSessionId}`);
        ws.onmessage = (event) => {
            const newMessage: Message = { role: 'assistant', content: event.data };
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        };
        setSocket(ws);

        return () => {
            ws.close();
        };
    }, []);

    const fetchChatHistory = async (sessionId: string) => {
        try {
            const response = await axios.get(`/chat/${sessionId}`);
            setMessages(response.data.chat_history || []);
        } catch (error) {
            console.error('Error fetching chat history:', error);
        }
    };

    const handleSendMessage = () => {
        if (!userInput || !sessionId || !socket) return;

        const newMessage: Message = { role: 'user', content: userInput };
        setMessages([...messages, newMessage]);
        setUserInput('');
        socket.send(userInput);
    };

    return (
        <div className="chatbot">
            <button
                className="chatbot-toggle"
                type="button"
                aria-haspopup="dialog"
                aria-expanded="false"
                data-state="closed"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="30"
                    height="40"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="chatbot-icon"
                >
                    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" />
                </svg>
            </button>

            <div className="chatbot-window">
                <div className="chatbot-header">
                    <h2>AI Chatbot</h2>
                    <p>Code Challenge: AI Chatbot Interface with Streaming</p>
                </div>

                <div className="chatbot-messages">
                    {messages.map((message, index) => (
                        <div key={index} className={`chatbot-message ${message.role}`}>
                            <div className="chatbot-avatar">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className="chatbot-avatar-icon"
                                >
                                    <path
                                        d={
                                            message.role === 'user'
                                                ? 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
                                                : 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'
                                        }
                                    />
                                </svg>
                            </div>
                            <div className="chatbot-message-content">
                                <strong>{message.role === 'user' ? 'You' : 'AI'}</strong>
                                <p>{message.content}</p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="chatbot-input">
                    <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
                        <input
                            type="text"
                            value={userInput}
                            onChange={(e) => setUserInput(e.target.value)}
                            placeholder="Type your message"
                            disabled={isTyping}
                        />
                        <button type="submit" disabled={isTyping}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
