import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Mic, Bot } from "lucide-react";
import "../components-css/ChatInterface.css";

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
  const [hasSentInitial, setHasSentInitial] = useState(false);

  useEffect(() => {
    if (initialQuery && chatHistory.length === 0 && !hasSentInitial) {
      // Add the initial query (topic and description) as the first user message
      const newMessage: ChatMessage = {
        type: "user",
        content: initialQuery,
        timestamp: new Date().toISOString(),
      };

      setHasSentInitial(true);
      setChatHistory([newMessage]);
    }
  }, [initialQuery, chatHistory.length, hasSentInitial]);

  useEffect(() => {
    // Trigger handleSend only after the initial message is added to the chat history
    if (
      hasSentInitial &&
      chatHistory.length === 1 &&
      chatHistory[0].type === "user"
    ) {
      handleSend(chatHistory[0].content);
    }
  }, [hasSentInitial, chatHistory]);

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
        .map(
          (msg) =>
            `${msg.type === "user" ? "Student" : "Assistant"}: ${msg.content}`
        )
        .join("\n");

      console.log("Sending request to backend:", {
        message: messageToSend,
        conversation_history: conversationHistory,
      });

      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          message: messageToSend,
          conversation_history: conversationHistory,
        }),
      }).catch((error) => {
        console.error("Network error:", error);
        throw new Error(`Network error: ${error.message}`);
      });

      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Unknown error" }));
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
        content:
          "Sorry, there was an error processing your request. Please try again.",
        timestamp: new Date().toISOString(),
      };
      setChatHistory((currentHistory) => [...currentHistory, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceRecord = async () => {
    if (!isRecording) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        const mediaRecorder = new MediaRecorder(stream);
        const audioChunks: Blob[] = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });

          // Convert to ArrayBuffer for proper WAV format
          const arrayBuffer = await audioBlob.arrayBuffer();
          const wavData = new Uint8Array(arrayBuffer);

          try {
            const response = await fetch(`${API_BASE_URL}/api/transcribe`, {
              method: "POST",
              headers: {
                "Content-Type": "audio/wav",
              },
              body: wavData,
            });

            if (!response.ok) {
              throw new Error("Transcription failed");
            }

            const data = await response.json();
            setMessage(data.transcription);
          } catch (error) {
            console.error("Error transcribing audio:", error);
            setError("Failed to transcribe audio. Please try again.");
          }

          stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);

        // Stop recording after 30 seconds
        setTimeout(() => {
          if (isRecording) {
            mediaRecorder.stop();
            setIsRecording(false);
          }
        }, 30000);
      } catch (error) {
        console.error("Error accessing microphone:", error);
        setError("Failed to access microphone. Please check your permissions.");
        setIsRecording(false);
      }
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div className="chat-inter">
      <div className="chat-header p-3 ">
        <div className="header">
          <h2 className="text-lg font-semibold">
            Madz - Your AI Legal Assistant
          </h2>
          <p className="text-sm text-muted text-white">
            Discussing: {topic.replace("-", " ").toUpperCase()}
          </p>
        </div>
      </div>

      <div className="h-[calc(100vh-12rem)] inner-chat flex flex-col bg-background rounded-xl shadow-sm overflow-hidden border">
        {/* Error Message */}
        {error && (
          <div className="p-2 error bg-red-100 text-red-600 text-sm">
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
                    ? "message-bubble-user text-white"
                    : "message-bubble-ai"
                }`}
              >
                {msg.type === "ai" && (
                  <div className="flex items-center mb-1 ai-text">
                    <Bot className="h-4 w-4 mr-1 text-primary " />
                    <span className="text-sm text-primary font-semibold">
                      Madz
                    </span>
                  </div>
                )}
                {msg.type === "ai" ? (
                  <div className="text-s ai-text">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <p className="text-s user-text">{msg.content}</p>
                )}
                <span className="text-xs ai-text opacity-75 mt-1 block">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[80%] rounded-lg p-3 ">
                <div className="flex items-center mb-1">
                  <Bot className="h-4 w-4 text-primary mr-1" />
                  <span className="text-sm text-primary font-semibold">
                    Madz
                  </span>
                </div>

                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Input Area */}
        <div className=" p-3 message-input">
          <div className="flex items-center space-x-2">
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
              className="p-2 bg-primary text-black send-btn rounded-full hover:secondary"
              disabled={isLoading}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3">
            <button onClick={onComplete} className="btn-secondary continue-btn">
              Continue to Local Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
