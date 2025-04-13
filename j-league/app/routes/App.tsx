import React, { useState } from "react";
import { Search, BookOpen, MapPin, ArrowRight, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopicSelector from "../../components/TopicSelector";
import ChatInterface from "../../components/ChatInterface";
import LocalResources from "../../components/LocalResources";
import ActionWizard from "../../components/ActionWizard";
import Summary from "../../components/Summary";
import "../app.css";
import "../index.css";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

function App() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [currentStep, setCurrentStep] = useState("topics");
  const [userLocation, setUserLocation] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [caseDetails, setCaseDetails] = useState({
    notes: [],
    documents: [],
    evidence: [],
  });

  const steps = {
    topics: "Select Topic",
    chat: "AI Chat",
    resources: "Resources",
    wizard: "Steps",
    summary: "Summary",
  };

  const stepOrder = Object.keys(steps);

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
    setCurrentStep("chat");
  };

  const handleBack = () => {
    if (currentStep === "chat") {
      setShowConfirmation(true);
      return;
    }
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const handleConfirmBack = () => {
    setShowConfirmation(false);
    setCurrentStep("topics");
    setChatHistory([]);
  };

  const handleCancelBack = () => {
    setShowConfirmation(false);
  };

  const handleGoHome = () => {
    setCurrentStep("topics");
    setSelectedTopic("");
    setChatHistory([]);
    setCaseDetails({
      notes: [],
      documents: [],
      evidence: [],
    });
  };

  const handleVoiceRecord = (audioBlob: Blob) => {
    // Here you would typically send the audio to a speech-to-text service
    // For now, we'll simulate by adding a placeholder message
    const newMessage: ChatMessage = {
      type: "user",
      content: "[Voice Recording Transcription]",
      timestamp: new Date().toISOString(),
      isVoice: true,
    };
    setChatHistory([...chatHistory, newMessage]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background">
      {/* Mobile Navigation */}
      <nav className="bg-background shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="px-4 py-3 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {currentStep !== "topics" && (
                <button onClick={handleBack} className="nav-icon">
                  <ArrowLeft className="h-5 w-5" />
                </button>
              )}
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="ml-2 text-lg font-semibold text-foreground ">
                KnowYourRights
              </span>
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-muted" />
            </div>
          </div>
        </div>
      </nav>

      {/* Confirmation Dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full mx-4">
            <h3 className="section-title">Confirm Exit</h3>
            <p className="text-muted mb-4">
              Are you sure you want to go back? Your chat history will not be
              saved.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={handleCancelBack} className="btn-neutral">
                Cancel
              </button>
              <button onClick={handleConfirmBack} className="btn-exit">
                Exit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Progress Steps */}
      <div className="px-4 py-3 mt-14 overflow-x-auto">
        <div className="flex space-x-4 min-w-max justify-center">
          {Object.entries(steps).map(([key, label], index) => (
            <div
              key={key}
              className={`progress-step ${
                index < Object.keys(steps).indexOf(currentStep)
                  ? "progress-step-completed"
                  : index === Object.keys(steps).indexOf(currentStep)
                  ? "progress-step-active"
                  : "progress-step-pending"
              }`}
            >
              <span className="flex items-center justify-center h-6 w-6 rounded-full border-2 border-current text-sm">
                {index + 1}
              </span>
              <span className="ml-2 text-sm">{label}</span>
              {index < Object.keys(steps).length - 1 && (
                <ArrowRight className="mx-2 h-4 w-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Content Area */}
      <main className="px-4 py-4 mb-16 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentStep === "topics" && (
            <motion.div
              key="topics"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TopicSelector
                onSelect={handleTopicSelect}
                onVoiceRecord={handleVoiceRecord}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            </motion.div>
          )}
          {currentStep === "chat" && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ChatInterface
                topic={selectedTopic}
                onComplete={() => setCurrentStep("resources")}
                chatHistory={chatHistory}
                setChatHistory={setChatHistory}
              />
            </motion.div>
          )}
          {currentStep === "resources" && (
            <motion.div
              key="resources"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <LocalResources
                topic={selectedTopic}
                location={userLocation}
                onComplete={() => setCurrentStep("wizard")}
              />
            </motion.div>
          )}
          {currentStep === "wizard" && (
            <motion.div
              key="wizard"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <ActionWizard
                topic={selectedTopic}
                onComplete={() => setCurrentStep("summary")}
                caseDetails={caseDetails}
                setCaseDetails={setCaseDetails}
              />
            </motion.div>
          )}
          {currentStep === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Summary
                topic={selectedTopic}
                chatHistory={chatHistory}
                location={userLocation}
                caseDetails={caseDetails}
                onGoHome={handleGoHome}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
