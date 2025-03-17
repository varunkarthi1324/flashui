import React, { useState } from "react";
import "./App.css";

/* Navbar Component */
function Navbar({ onSidebarToggle, onThemeToggle, theme }) {
  return (
    <header className="app-navbar">
      <div className="navbar-left">
        <button className="sidebar-toggle-btn" onClick={onSidebarToggle}>
          ☰
        </button>
        <div className="nav-title">ChatGPT Clone</div>
      </div>
      <button className="theme-toggle-btn" onClick={onThemeToggle}>
        {theme === "dark" ? "🌞 Light Mode" : "🌙 Dark Mode"}
      </button>
    </header>
  );
}

/* Sidebar Component */
function Sidebar({ chatHistory, onNewChat, onSelectChat, isOpen }) {
  return (
    <aside
      className={`app-sidebar ${isOpen ? "sidebar-open" : "sidebar-closed"}`}
    >
      <div className="sidebar-header">
        <span>Chat History</span>
        <button onClick={onNewChat} className="new-chat-button">
          + New Chat
        </button>
      </div>
      <ul className="chat-history">
        {chatHistory.map((session, index) => (
          <li
            key={index}
            onClick={() => onSelectChat(session)}
            className="chat-history-item"
          >
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
    if (e.key === "Enter" && !e.shiftKey) {
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
        <textarea
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

/* Main App Component */
function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [chatHistory, setChatHistory] = useState(["Session 1", "Session 2"]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Sidebar starts closed
  const [theme, setTheme] = useState("dark"); // Default to dark mode

  const handleSend = () => {
    if (!input.trim()) return;
    const userMessage = { sender: "user", text: input };
    const botResponse = {
      sender: "bot",
      text: `You said: "${input}"`,
    };
    setMessages((prevMessages) => [...prevMessages, userMessage, botResponse]);
    setInput("");
  };

  const handleNewChat = () => {
    setChatHistory((prevHistory) => [
      ...prevHistory,
      `Session ${prevHistory.length + 1}`,
    ]);
    setMessages([]);
  };

  const handleSelectChat = (session) => {
    alert(`Selected: ${session}`);
  };

  const handleThemeToggle = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    document.documentElement.setAttribute(
      "data-theme",
      theme === "dark" ? "light" : "dark"
    );
  };

  return (
    <div className="app-container">
      <Navbar
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        onThemeToggle={handleThemeToggle}
        theme={theme}
      />
      <Sidebar
        chatHistory={chatHistory}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        isOpen={sidebarOpen}
      />
      <ChatArea
        messages={messages}
        input={input}
        onInputChange={(e) => setInput(e.target.value)}
        onSend={handleSend}
      />
    </div>
  );
}

export default App;
