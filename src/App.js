import React, { useState } from "react";
import "./App.css";

/* Navbar Component with Sidebar Toggle Button */
function Navbar({ onSidebarToggle }) {
  return (
    <header className="app-navbar">
      <button className="sidebar-toggle-btn" onClick={onSidebarToggle}>
        ☰
      </button>
      <h1>Flash</h1>
    </header>
  );
}

/* Sidebar Component */
function Sidebar({ chatHistory, onNewChat, onSelectChat }) {
  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <h3>Chat History</h3>
        <button onClick={onNewChat} className="new-chat-button">
          + New Chat
        </button>
      </div>
      <ul className="chat-history">
        {chatHistory.map((session, index) => (
          <li key={index} onClick={() => onSelectChat(session)}>
            {session}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* Chat Area Component */
function ChatArea({ messages, input, onInputChange, onSend }) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <section className="chat-area">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${
              msg.sender === "user" ? "user-message" : "bot-message"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <div className="chat-input-section">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={onInputChange}
          onKeyDown={handleKeyDown}
          className="chat-input"
        />
        <button onClick={onSend} className="send-button">
          Send
        </button>
      </div>
    </section>
  );
}

/* Main UI Component */
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState(["Session 1", "Session 2"]);
  const [sidebarVisible, setSidebarVisible] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    const botResponse = {
      sender: "bot",
      text: "This is a placeholder response.",
    };

    setMessages((prevMessages) => [...prevMessages, userMessage, botResponse]);
    setInput("");
  };

  const handleNewChat = () => {
    const newSession = `Session ${chatHistory.length + 1}`;
    setChatHistory([...chatHistory, newSession]);
    setMessages([]);
  };

  const handleSelectChat = (session) => {
    setMessages([]);
  };

  const toggleSidebar = () => {
    setSidebarVisible((prevVisible) => !prevVisible);
  };

  return (
    <div className="app-container">
      <Navbar onSidebarToggle={toggleSidebar} />
      <div className="main-content">
        {sidebarVisible && (
          <Sidebar
            chatHistory={chatHistory}
            onNewChat={handleNewChat}
            onSelectChat={handleSelectChat}
          />
        )}
        <ChatArea
          messages={messages}
          input={input}
          onInputChange={(e) => setInput(e.target.value)}
          onSend={handleSend}
        />
      </div>
    </div>
  );
}

export default App;
