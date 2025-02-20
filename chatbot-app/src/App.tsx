// src/App.tsx
import React from "react";
import Chatbot from "./components/Chatbot";
import './App.css';

const App: React.FC = () => {
  return (
    <div className="app">
      <header className="app-header">
        <h1>AI chatBot</h1>
      </header>
      <main className="app-main">
        <Chatbot />
      </main>
      <footer className="app-footer">
        <p>&copy; 2025 My Chatbot App</p>
      </footer>
    </div>
  );
};

export default App;
