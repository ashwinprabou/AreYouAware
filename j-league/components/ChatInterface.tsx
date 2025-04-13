import React, { useState } from "react";
import { Send, Mic, Bot } from "lucide-react";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface ChatInterfaceProps {
  topic: string;
  onComplete: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
}

function ChatInterface({
  topic,
  onComplete,
  chatHistory,
  setChatHistory,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  const handleSend = () => {
    if (!message.trim()) return;

    const newMessage: ChatMessage = {
      type: "user",
      content: message,
      timestamp: new Date().toISOString(),
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        type: "ai",
        content:
          "This is a simulated AI response. In the actual implementation, this would be replaced with the real AI response.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((currentHistory) => [...currentHistory, aiResponse]);
    }, 1000);
  };

  return (
    <div className="h-[calc(100vh-11rem)] flex flex-col bg-background rounded-xl shadow-sm overflow-hidden border">
      {/* Chat Header */}
      <div className="bg-primary p-3 text-white">
        <h2 className="text-lg font-semibold">AI Legal Assistant</h2>
        <p className="text-sm text-muted text-white">
          Discussing: {topic.replace("-", " ").toUpperCase()}
        </p>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                msg.type === "user"
                  ? "message-bubble-user"
                  : "message-bubble-ai bg-gray-200"
              }`}
            >
              {msg.type === "ai" && (
                <div className="flex items-center mb-1">
                  <Bot className="h-4 w-4 mr-1" />
                  <span className="text-sm font-semibold">AI Assistant</span>
                </div>
              )}
              <p className="text-sm">{msg.content}</p>
              <span className="text-xs opacity-75 mt-1 block">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Input Area */}
      <div className="border-t border-border p-3 bg-background">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-2 rounded-full bg-primary ${
              isRecording ? "bg-red-100 text-red-600" : "hover:bg-muted"
            }`}
          >
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="input-field"
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button
            onClick={handleSend}
            className="p-2 bg-primary text-white rounded-full hover:secondary"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-3">
          <button onClick={onComplete} className="btn-secondary">
            Continue to Local Resources
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
