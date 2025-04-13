import React, { useState } from "react";
import TopicSelector from "./components/TopicSelector";
import ChatInterface from "./components/ChatInterface";
import Summary from "./components/Summary";
import ActionWizard from "./components/ActionWizard";
import LocalResources from "./components/LocalResources";
import { CheckCircle } from "lucide-react";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface CaseDetails {
  notes: Array<{ id: string; content: string; date: string }>;
  documents: Array<{ id: string; name: string; url: string }>;
  evidence: Array<{ id: string; type: string; description: string }>;
}

const steps = [
  { id: "topic-selector", title: "Select Topic" },
  { id: "chat", title: "AI Chat" },
  { id: "local-resources", title: "Resources" },
  { id: "action-wizard", title: "Steps" },
  { id: "summary", title: "Summary" },
];

function App() {
  const [currentView, setCurrentView] = useState("topic-selector");
  const [topic, setTopic] = useState("");
  const [location, setLocation] = useState("San Francisco, CA");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [caseDetails, setCaseDetails] = useState<CaseDetails>({
    notes: [],
    documents: [],
    evidence: [],
  });

  const handleTopicSelect = (selectedTopic: string) => {
    setTopic(selectedTopic);
    setCurrentView("chat");
  };

  const handleChatComplete = () => {
    setCurrentView("local-resources");
  };

  const handleResourcesComplete = () => {
    setCurrentView("action-wizard");
  };

  const handleActionComplete = () => {
    setCurrentView("summary");
  };

  const handleGoHome = () => {
    setCurrentView("topic-selector");
    setTopic("");
    setChatHistory([]);
    setCaseDetails({
      notes: [],
      documents: [],
      evidence: [],
    });
  };

  const currentStepIndex = steps.findIndex(step => step.id === currentView);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <div className="max-w-3xl mx-auto p-4 h-screen flex flex-col overflow-hidden">
        {/* Progress Steps */}
        <div className="flex justify-center items-center gap-4 mb-6">
          {steps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStepIndex
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {index < currentStepIndex ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 ${
                    index <= currentStepIndex ? "text-foreground" : "text-muted"
                  }`}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-0.5 ${
                    index < currentStepIndex ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {currentView === "topic-selector" && (
          <TopicSelector
            onSelect={handleTopicSelect}
            onVoiceRecord={() => {}}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}
        {currentView === "chat" && (
          <ChatInterface
            topic={topic}
            onComplete={handleChatComplete}
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
          />
        )}
        {currentView === "local-resources" && (
          <LocalResources
            topic={topic}
            location={location}
            onComplete={handleResourcesComplete}
          />
        )}
        {currentView === "action-wizard" && (
          <ActionWizard
            topic={topic}
            onComplete={handleActionComplete}
            caseDetails={caseDetails}
            setCaseDetails={setCaseDetails}
          />
        )}
        {currentView === "summary" && (
          <Summary
            topic={topic}
            chatHistory={chatHistory}
            location={location}
            caseDetails={caseDetails}
            onGoHome={handleGoHome}
          />
        )}
      </div>
    </div>
  );
}

export default App;
