import React, { useState } from "react";
import {
  Shield,
  Car,
  Home,
  Users,
  Search,
  Mic,
  StopCircle,
} from "lucide-react";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface TopicSelectorProps {
  onSelect: (topic: string) => void;
  onVoiceRecord: (blob: Blob) => void;
  chatHistory: ChatMessage[];
  setChatHistory: (history: ChatMessage[]) => void;
}

const topics = [
  {
    id: "tenant-rights",
    title: "Tenant Rights",
    icon: Home,
    description: "Learn about your rights as a tenant and housing laws",
  },
  {
    id: "traffic-stops",
    title: "Traffic Stops",
    icon: Car,
    description:
      "Understand your rights during traffic stops and police interactions",
  },
  {
    id: "protest-guidelines",
    title: "Protest Guidelines",
    icon: Users,
    description:
      "Know your rights when participating in protests and demonstrations",
  },
  {
    id: "car-accident",
    title: "Car Accident",
    icon: Shield,
    description: "Steps to take after a car accident and your legal rights",
  },
];

function TopicSelector({
  onSelect,
  onVoiceRecord,
  chatHistory,
  setChatHistory,
}: TopicSelectorProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        onVoiceRecord(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const newMessage: ChatMessage = {
        type: "user",
        content: searchQuery,
        timestamp: new Date().toISOString(),
      };
      setChatHistory([...chatHistory, newMessage]);
      onSelect("custom-query");
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-foreground">
          What would you like to inquire about?
        </h1>
        <p className="mt-2 text-muted">Speak, type, or choose a topic</p>
      </div>

      {/* Voice Recording Button */}
      <div className="flex justify-center">
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`p-6 rounded-full ${
            isRecording
              ? "bg-destructive/10 text-exit animate-pulse "
              : "bg-primary/10 text-primary"
          }`}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center border-2 border-current">
            {isRecording ? (
              <StopCircle className="h-8 w-8" />
            ) : (
              <Mic className="h-8 w-8" />
            )}
          </div>
        </button>
      </div>

      {/* Mobile Search Bar */}
      <form
        onSubmit={handleSearch}
        className="relative flex items-center gap-2"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type your legal question..."
          className="input-field w-[200px]"
        />
        <button type="submit" className="btn-primary w-[80px]">
          Ask
        </button>
      </form>

      {/* Mobile Topics List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-foreground">Common Topics</h2>
        {topics.map((topic) => {
          const IconComponent = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => onSelect(topic.id)}
              className="w-full flex items-center p-4 card hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <IconComponent className="h-6 w-6 text-primary" />
              </div>
              <div className="ml-4 flex-1 text-left">
                <h3 className="text-base font-semibold text-foreground">
                  {topic.title}
                </h3>
                <p className="mt-1 text-sm text-muted">{topic.description}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default TopicSelector;
