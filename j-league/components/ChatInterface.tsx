import React, { useState, useEffect } from "react";
import { Send, Mic, Bot } from "lucide-react";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface ChatInterfaceProps {
  topic: string;
  initialQuery?: string;
  onComplete: () => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
}

const API_BASE_URL = "http://localhost:8000";

function ChatInterface({
  topic,
  initialQuery,
  onComplete,
  chatHistory,
  setChatHistory,
}: ChatInterfaceProps) {
  const [message, setMessage] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle initial query when component mounts
  useEffect(() => {
    if (initialQuery && chatHistory.length === 0) {
      console.log("Processing initial query:", initialQuery);
      const newMessage: ChatMessage = {
        type: "user",
        content: initialQuery,
        timestamp: new Date().toISOString(),
      };
      setChatHistory([newMessage]);
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  const handleSend = async (textToSend?: string) => {
    const messageToSend = textToSend || message;
    if (!messageToSend.trim()) return;

    console.log("Sending message:", messageToSend);
    setError(null);
    setIsLoading(true);

    const newMessage: ChatMessage = {
      type: "user",
      content: messageToSend,
      timestamp: new Date().toISOString(),
    };

    setChatHistory([...chatHistory, newMessage]);
    setMessage("");

    try {
      // Format conversation history for the API
      const conversationHistory = chatHistory
        .map(msg => `${msg.type === "user" ? "Student" : "Assistant"}: ${msg.content}`)
        .join("\n");

      console.log("Sending request to backend:", {
        message: messageToSend,
        conversation_history: conversationHistory,
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_history: conversationHistory,
        }),
      }).catch(error => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: "Unknown error" }));
        console.error("Error response:", errorData);
        throw new Error(errorData.detail || "Failed to get response from AI");
      }

      const data = await response.json();
      console.log("Received response from backend:", data);
      
      if (!data.response) {
        throw new Error("No response received from AI");
      }

      const aiResponse: ChatMessage = {
        type: "ai",
        content: data.response,
        timestamp: new Date().toISOString(),
      };
      
      setChatHistory((currentHistory) => [...currentHistory, aiResponse]);
    } catch (error) {
      console.error("Error in handleSend:", error);
      setError(error instanceof Error ? error.message : "An error occurred");
      const errorMessage: ChatMessage = {
        type: "ai",
        content: "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((currentHistory) => [...currentHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = async (blob: Blob) => {
    try {
      setIsLoading(true);
      
      // Send audio blob to backend for transcription
      const formData = new FormData();
      formData.append("audio_data", blob);

      const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to transcribe audio");
      }

      const data = await response.json();
      
      // Use the transcribed text as a message
      setMessage(data.transcription);
      handleSend();
    } catch (error) {
      console.error("Error:", error);
      const errorMessage: ChatMessage = {
        type: "ai",
        content: "Sorry, there was an error transcribing your voice message. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((currentHistory) => [...currentHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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

      {/* Error Message */}
      {error && (
        <div className="p-2 bg-red-100 text-red-600 text-sm">
          {error}
        </div>
      )}

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
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-[80%] rounded-lg p-3 bg-gray-200">
              <div className="flex items-center mb-1">
                <Bot className="h-4 w-4 mr-1" />
                <span className="text-sm font-semibold">AI Assistant</span>
              </div>
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
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
            disabled={isLoading}
          />
          <button
            onClick={() => handleSend()}
            className="p-2 bg-primary text-white rounded-full hover:secondary"
            disabled={isLoading}
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