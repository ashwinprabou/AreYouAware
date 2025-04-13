import React, { useState } from "react";
import {
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Camera,
  Paperclip,
} from "lucide-react";

interface CaseDetails {
  notes: Array<{ id: string; content: string; date: string }>;
  documents: Array<{ id: string; name: string; url: string }>;
  evidence: Array<{
    id: string;
    type: string;
    description: string;
    file?: File;
  }>;
}

interface NewEvidence {
  type: string;
  description: string;
  file?: File | undefined;
}

interface ActionWizardProps {
  topic: string;
  onComplete: () => void;
  caseDetails: CaseDetails;
  setCaseDetails: (details: CaseDetails) => void;
}

function ActionWizard({
  topic,
  onComplete,
  caseDetails,
  setCaseDetails,
}: ActionWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [newNote, setNewNote] = useState("");
  const [newEvidence, setNewEvidence] = useState<NewEvidence>({
    type: "",
    description: "",
    file: undefined,
  });

  const steps = [
    {
      title: "Document Situation",
      description: "Record key details",
      component: "notes",
    },
    {
      title: "Gather Evidence",
      description: "Collect documentation",
      component: "evidence",
    },
    {
      title: "Know Your Rights",
      description: "Review legal options",
      component: "rights",
    },
    {
      title: "Take Action",
      description: "Next steps",
      component: "action",
    },
  ];

  const handleAddNote = () => {
    if (newNote.trim()) {
      setCaseDetails({
        ...caseDetails,
        notes: [
          ...caseDetails.notes,
          {
            id: Date.now().toString(),
            content: newNote,
            date: new Date().toISOString(),
          },
        ],
      });
      setNewNote("");
    }
  };

  const handleDeleteNote = (noteId: string) => {
    setCaseDetails({
      ...caseDetails,
      notes: caseDetails.notes.filter((note) => note.id !== noteId),
    });
  };

  const handleAddEvidence = () => {
    if (newEvidence.type && newEvidence.description) {
      setCaseDetails({
        ...caseDetails,
        evidence: [
          ...caseDetails.evidence,
          {
            id: Date.now().toString(),
            ...newEvidence,
          },
        ],
      });
      setNewEvidence({ type: "", description: "", file: undefined });
    }
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setCaseDetails({
      ...caseDetails,
      evidence: caseDetails.evidence.filter(
        (evidence) => evidence.id !== evidenceId
      ),
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewEvidence((prev) => ({ ...prev, file }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to storage and get a URL
      const fakeUrl = URL.createObjectURL(file);
      setCaseDetails({
        ...caseDetails,
        documents: [
          ...caseDetails.documents,
          {
            id: Date.now().toString(),
            name: file.name,
            url: fakeUrl,
          },
        ],
      });
    }
  };

  const renderStepContent = () => {
    switch (steps[currentStep].component) {
      case "notes":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note about your situation..."
                className="input-field w-full rounded-md min-h-[120px] resize-none"
                rows={4}
              />
              <button onClick={handleAddNote} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Note
              </button>
            </div>
            <div className="space-y-2">
              {caseDetails.notes.map((note) => (
                <div
                  key={note.id}
                  className="message-bubble flex justify-between items-start"
                >
                  <div>
                    <p className="text-sm text-foreground">{note.content}</p>
                    <p className="text-xs text-muted mt-1">
                      {new Date(note.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="text-muted hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      case "evidence":
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="text"
                value={newEvidence.type}
                onChange={(e) =>
                  setNewEvidence({ ...newEvidence, type: e.target.value })
                }
                placeholder="Type of evidence"
                className="input-field rounded-md"
              />
              <textarea
                value={newEvidence.description}
                onChange={(e) =>
                  setNewEvidence({
                    ...newEvidence,
                    description: e.target.value,
                  })
                }
                placeholder="Description of evidence..."
                className="input-field w-full rounded-md min-h-[120px] resize-none"
                rows={3}
              />
              <div className="flex items-center space-x-2">
                <label className="btn-secondary cursor-pointer">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  <Paperclip className="h-4 w-4 mr-2" />
                  Attach File (PNG or JPG)
                </label>
                {newEvidence.file && (
                  <span className="text-sm text-foreground">
                    {newEvidence.file.name}
                  </span>
                )}
              </div>
              <button onClick={handleAddEvidence} className="btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Add Evidence
              </button>
            </div>
            <div className="space-y-2">
              {caseDetails.evidence.map((item) => (
                <div
                  key={item.id}
                  className="message-bubble flex justify-between items-start"
                >
                  <div>
                    <h4 className="font-medium text-foreground">{item.type}</h4>
                    <p className="text-sm text-foreground mt-1">
                      {item.description}
                    </p>
                    {item.file && (
                      <div className="flex items-center mt-2 text-sm text-muted">
                        <Paperclip className="h-4 w-4 mr-2" />
                        {item.file.name}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteEvidence(item.id)}
                    className="text-muted hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            {["Item 1", "Item 2", "Item 3"].map((item, index) => (
              <div key={index} className="message-bubble flex items-center">
                <CheckCircle className="h-4 w-4 text-primary mr-2" />
                <span className="text-sm text-foreground">{item}</span>
              </div>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Action Steps</h2>
        <p className="mt-2 text-sm text-muted">
          Follow these steps to document your case
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step.title}>
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  index <= currentStep
                    ? "bg-primary text-white"
                    : "bg-muted text-primary"
                }`}
              >
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span
                className={`text-xs mt-1 ${
                  index <= currentStep ? "text-foreground" : "text-muted"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5  ${
                  index < currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="card">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              {steps[currentStep].title}
            </h3>
            <p className="text-sm text-muted">
              {steps[currentStep].description}
            </p>
          </div>
          {renderStepContent()}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between gap-4">
        <button
          onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
          className={`btn-neutral flex items-center ${
            currentStep === 0 ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </button>
        <button
          onClick={() =>
            currentStep === steps.length - 1
              ? onComplete()
              : setCurrentStep((prev) => Math.min(steps.length - 1, prev + 1))
          }
          className="btn-primary flex items-center"
        >
          {currentStep === steps.length - 1 ? "Complete" : "Next"}
          <ChevronRight className="h-4 w-4 ml-2" />
        </button>
      </div>
    </div>
  );
}

export default ActionWizard;
