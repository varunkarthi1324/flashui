import React, { useState, useRef, useEffect } from "react";
import "./App.css";

// Enhanced mock chat functionality with support for multiple sessions
const useChatMock = () => {
  const [sessions, setSessions] = useState({
    default: { messages: [], id: "default", name: "New conversation" },
  });
  const [activeSessionId, setActiveSessionId] = useState("default");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [codeMode, setCodeMode] = useState(false);
  const [code, setCode] = useState(`// Type your code here
console.log("Hello, world!");
// You can use document.getElementById("output").innerHTML to modify the output
document.getElementById("output").innerHTML = "<h2>Hello, World!</h2><p>This is the output from your code.</p>";
`);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleCodeChange = (newCode) => {
    setCode(newCode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message to current session
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      isCode: codeMode,
      code: codeMode ? code : null,
    };

    setSessions((prev) => ({
      ...prev,
      [activeSessionId]: {
        ...prev[activeSessionId],
        messages: [...prev[activeSessionId].messages, userMessage],
        name: input.slice(0, 20) + (input.length > 20 ? "..." : ""),
      },
    }));

    setInput("");
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse;

      if (codeMode) {
        // If code mode is on, create a response with evaluated code
        aiResponse = {
          id: Date.now() + 1,
          role: "assistant",
          content: "Here's the output of your code:",
          isCode: true,
          code: code,
          output: evaluateCode(code),
        };
      } else {
        // Regular chat response
        const aiResponses = [
          "I'm Flash AI, your intelligent assistant. How can I help you today?",
          "That's an interesting question. Let me think about that for a moment...",
          "Based on my knowledge, I can provide you with several approaches to solve this problem.",
          "Here's what I found about that topic. Let me know if you need more details.",
          "I'd be happy to help you with that! Let's break this down step by step.",
        ];

        const randomResponse =
          aiResponses[Math.floor(Math.random() * aiResponses.length)];

        aiResponse = {
          id: Date.now() + 1,
          role: "assistant",
          content: randomResponse,
          isCode: false,
        };
      }

      setSessions((prev) => ({
        ...prev,
        [activeSessionId]: {
          ...prev[activeSessionId],
          messages: [...prev[activeSessionId].messages, aiResponse],
        },
      }));

      setIsLoading(false);
      setCodeMode(false);
    }, 1500);
  };

  const evaluateCode = (codeToEvaluate) => {
    try {
      // Create a sandbox to run the code safely
      const sandbox = document.createElement("div");
      sandbox.id = "output";

      // Instead of using new Function, use a safer approach
      // that isolates the code execution
      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      // Set up the iframe content
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
      iframeDoc.open();
      iframeDoc.write(`
        <div id="output"></div>
        <script>
          try {
            const output = document.getElementById('output');
            ${codeToEvaluate}
          } catch(error) {
            document.getElementById('output').innerHTML = 'Error: ' + error.message;
          }
        </script>
      `);
      iframeDoc.close();

      // Get the output from the iframe
      const output =
        iframeDoc.getElementById("output").innerHTML ||
        "Code executed successfully but produced no output.";

      // Clean up
      document.body.removeChild(iframe);

      return output;
    } catch (err) {
      return `Error: ${err.message}`;
    }
  };

  const createNewSession = () => {
    const newSessionId = `session-${Date.now()}`;
    setSessions((prev) => ({
      ...prev,
      [newSessionId]: {
        messages: [],
        id: newSessionId,
        name: "New conversation",
        date: "Just now",
      },
    }));
    setActiveSessionId(newSessionId);
    setInput("");
    setIsLoading(false);
    setCodeMode(false);
    return newSessionId;
  };

  const switchSession = (sessionId) => {
    if (sessions[sessionId]) {
      setActiveSessionId(sessionId);
    } else {
      createNewSession();
    }
  };

  const clearAllSessions = () => {
    // Create a new session first
    const newSessionId = `session-${Date.now()}`;

    // Then clear all other sessions
    setSessions({
      [newSessionId]: {
        messages: [],
        id: newSessionId,
        name: "New conversation",
        date: "Just now",
      },
    });

    // Set the active session to the new one
    setActiveSessionId(newSessionId);
    setInput("");
    setIsLoading(false);
    setCodeMode(false);
  };

  const toggleCodeMode = () => {
    setCodeMode(!codeMode);
  };

  return {
    sessions,
    activeSessionId,
    activeMessages: sessions[activeSessionId]?.messages || [],
    input,
    code,
    codeMode,
    handleInputChange,
    handleCodeChange,
    handleSubmit,
    isLoading,
    createNewSession,
    switchSession,
    clearAllSessions,
    toggleCodeMode,
  };
};

// Mock theme functionality
const useTheme = () => {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  return { theme, setTheme };
};

// Mock mobile detection
const useMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
};

// Utility function to conditionally join class names
const cn = (...classes) => classes.filter(Boolean).join(" ");

// Simple markdown renderer
const ReactMarkdown = ({ children }) => {
  // This is a very simplified markdown renderer
  // In a real app, you'd use a proper markdown library
  const formatted = children
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/\n/g, "<br />");

  return <div dangerouslySetInnerHTML={{ __html: formatted }} />;
};

// Updated CodeEditorWithPreview Component
const CodeEditorWithPreview = ({ code, onCodeChange, output }) => {
  const runCode = () => {
    onCodeChange(code); // Trigger a re-evaluation
  };

  return (
    <div className="split-screen-editor">
      <div className="editor-pane">
        <div className="code-header">
          <span>JavaScript</span>
          <button className="run-button" onClick={runCode}>
            Run
          </button>
        </div>
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          spellCheck="false"
        />
      </div>
      <div className="preview-pane">
        <div className="output-header">Output</div>
        <div
          className="output-content"
          dangerouslySetInnerHTML={{ __html: output }}
        />
      </div>
    </div>
  );
};

// Chat Message Component
const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "message-container",
        isUser ? "user-message" : "ai-message"
      )}
    >
      {!isUser && (
        <div className="avatar bot-avatar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 8V4m0 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <path d="M12 16v4M4.93 19.07A10 10 0 0 1 2 12C2 6.48 6.48 2 12 2s10 4.48 10 10c0 2.76-1.12 5.26-2.93 7.07" />
          </svg>
        </div>
      )}

      <div
        className={cn("message-bubble", isUser ? "user-bubble" : "ai-bubble")}
      >
        {message.isCode ? (
          <div className="code-message">
            <div className="code-message-content">{message.content}</div>
            {isUser ? (
              <div className="user-code-preview">
                <pre>
                  <code>{message.code}</code>
                </pre>
              </div>
            ) : (
              <div className="code-preview-container">
                <div className="code-preview">
                  <pre>
                    <code>{message.code}</code>
                  </pre>
                </div>
                <div className="code-preview-output">
                  <div className="output-header">Output:</div>
                  <div dangerouslySetInnerHTML={{ __html: message.output }} />
                </div>
              </div>
            )}
          </div>
        ) : isUser ? (
          <div>{message.content}</div>
        ) : (
          <ReactMarkdown>{message.content}</ReactMarkdown>
        )}
      </div>

      {isUser && (
        <div className="avatar user-avatar">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </div>
      )}
    </div>
  );
};

// Welcome Screen Component
const WelcomeScreen = ({ onStartChat }) => {
  const examples = [
    "Explain quantum computing in simple terms",
    "Write a poem about artificial intelligence",
    "How do I create a REST API with Node.js?",
    "What are the best practices for React performance?",
  ];

  return (
    <div className="welcome-screen">
      <div className="welcome-header">
        <svg
          className="flash-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
        <h1>Flash AI</h1>
      </div>

      <p className="welcome-subtitle">
        Your intelligent assistant powered by cutting-edge AI
      </p>

      <div className="example-grid">
        {examples.map((example, index) => (
          <div key={index} className="example-card">
            <p>{example}</p>
          </div>
        ))}
      </div>

      <button onClick={onStartChat} className="start-button">
        Start Chatting
      </button>
    </div>
  );
};

// Header Component
const Header = () => {
  const { theme, setTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo">
          <svg
            className="flash-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>Flash AI</span>
        </div>

        <button
          className="theme-toggle"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

// Sidebar Component
const Sidebar = ({
  sessions,
  activeSessionId,
  onSessionClick,
  onNewChat,
  onClearAll,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useMobile();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  // Convert sessions object to array and sort by most recent
  const conversationsList = Object.values(sessions)
    .filter((session) => session.messages.length > 0)
    .sort((a, b) => {
      const aLastMessageTime =
        a.messages.length > 0 ? a.messages[a.messages.length - 1].id : 0;
      const bLastMessageTime =
        b.messages.length > 0 ? b.messages[b.messages.length - 1].id : 0;
      return bLastMessageTime - aLastMessageTime;
    });

  return (
    <>
      {isMobile && (
        <button className="mobile-menu-button" onClick={toggleSidebar}>
          {isOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          )}
        </button>
      )}

      <div
        className={cn(
          "sidebar",
          isMobile && (isOpen ? "sidebar-open" : "sidebar-closed")
        )}
      >
        <div className="sidebar-header">
          <svg
            className="flash-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>
          <span>Flash AI</span>
        </div>

        <div className="new-chat-container">
          <button className="new-chat-button" onClick={onNewChat}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span>New Chat</span>
          </button>
        </div>

        <div className="conversations-container">
          <div className="conversations-list">
            <h3 className="conversations-heading">Recent Conversations</h3>
            {conversationsList.length > 0 ? (
              conversationsList.map((session) => (
                <button
                  key={session.id}
                  className={cn(
                    "conversation-button",
                    session.id === activeSessionId && "active-conversation"
                  )}
                  onClick={() => onSessionClick(session.id)}
                >
                  <svg
                    className="message-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  <div className="conversation-info">
                    <span className="conversation-name">{session.name}</span>
                    <span className="conversation-date">
                      {session.date || "Just now"}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="no-conversations">No conversations yet</div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="settings-button">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
            <span>Settings</span>
          </button>
          <button className="clear-button" onClick={onClearAll}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
            </svg>
            <span>Clear conversations</span>
          </button>
        </div>
      </div>
    </>
  );
};

// Chat Interface Component
const ChatInterface = ({
  messages,
  input,
  code,
  codeMode,
  handleInputChange,
  handleCodeChange,
  handleSubmit,
  isLoading,
  createNewSession,
  toggleCodeMode,
}) => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [codeOutput, setCodeOutput] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messages.length > 0 && showWelcome) {
      setShowWelcome(false);
    }
  }, [messages, showWelcome]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (codeMode) {
      try {
        // Create a sandbox iframe to run the code safely
        const iframe = document.createElement("iframe");
        iframe.style.display = "none";
        document.body.appendChild(iframe);

        // Set up the iframe content
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow.document;
        iframeDoc.open();
        iframeDoc.write(`
          <div id="output"></div>
          <script>
            try {
              const output = document.getElementById('output');
              ${code}
            } catch(error) {
              document.getElementById('output').innerHTML = 'Error: ' + error.message;
            }
          </script>
        `);
        iframeDoc.close();

        // Get the output from the iframe
        const output =
          iframeDoc.getElementById("output").innerHTML ||
          "Code executed successfully but produced no output.";

        // Clean up
        document.body.removeChild(iframe);

        setCodeOutput(output);
      } catch (err) {
        setCodeOutput(`Error: ${err.message}`);
      }
    }
  }, [code, codeMode]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if ((codeMode && code.trim()) || (!codeMode && input.trim())) {
      handleSubmit(e);
    }
  };

  const startNewChat = () => {
    createNewSession();
    setShowWelcome(false);
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {showWelcome ? (
          <WelcomeScreen onStartChat={startNewChat} />
        ) : (
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-chat-message">
                <p>Type a message to start the conversation</p>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="loading-indicator">
                <svg
                  className="spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <p>Flash is thinking...</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="input-container">
        {codeMode ? (
          <div className="code-editor-container">
            <CodeEditorWithPreview
              code={code}
              onCodeChange={handleCodeChange}
              output={codeOutput}
            />
          </div>
        ) : null}

        <form onSubmit={handleFormSubmit} className="input-form">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder={
              codeMode
                ? "Add a description for your code..."
                : "Ask Flash anything..."
            }
            className="message-input"
            disabled={isLoading}
          />
          <button
            type="button"
            className="code-toggle-button"
            onClick={toggleCodeMode}
            title={codeMode ? "Switch to Chat Mode" : "Switch to Code Mode"}
          >
            {codeMode ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 9l3 3-3 3M13 9h3M13 15h3" />
                <rect x="3" y="3" width="18" height="18" rx="2" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
            )}
          </button>
          <button
            type="submit"
            className="send-button"
            disabled={
              (codeMode && !code.trim()) ||
              (!codeMode && !input.trim()) ||
              isLoading
            }
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
          {messages.length > 0 && (
            <button
              type="button"
              className="reset-button"
              onClick={createNewSession}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

// Main App Component
function App() {
  const {
    sessions,
    activeSessionId,
    activeMessages,
    input,
    code,
    codeMode,
    handleInputChange,
    handleCodeChange,
    handleSubmit,
    isLoading,
    createNewSession,
    switchSession,
    clearAllSessions,
    toggleCodeMode,
  } = useChatMock();

  return (
    <div className="app">
      <Sidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSessionClick={switchSession}
        onNewChat={createNewSession}
        onClearAll={clearAllSessions}
      />
      <div className="main-content">
        <Header />
        <main className="main-area">
          <ChatInterface
            messages={activeMessages}
            input={input}
            code={code}
            codeMode={codeMode}
            handleInputChange={handleInputChange}
            handleCodeChange={handleCodeChange}
            handleSubmit={handleSubmit}
            isLoading={isLoading}
            createNewSession={createNewSession}
            toggleCodeMode={toggleCodeMode}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
