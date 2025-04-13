import React from "react";
import {
  Download,
  Share2,
  Bell,
  FileText,
  Camera,
  Paperclip,
  Home,
} from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface ChatMessage {
  type: "user" | "ai";
  content: string;
  timestamp: string;
  isVoice?: boolean;
}

interface SummaryProps {
  topic: string;
  chatHistory: ChatMessage[];
  location: string;
  caseDetails: {
    notes: Array<{ id: string; content: string; date: string }>;
    documents: Array<{ id: string; name: string; url: string }>;
    evidence: Array<{
      id: string;
      type: string;
      description: string;
      file?: File;
    }>;
  };
  onGoHome: () => void;
}

function Summary({
  topic,
  chatHistory,
  location,
  caseDetails,
  onGoHome,
}: SummaryProps) {
  const generateCaseFile = async () => {
    const doc = new jsPDF();

    // Add header
    doc.setFontSize(20);
    doc.text("Case Summary", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Topic: ${topic}`, 20, 30);
    doc.text(`Location: ${location}`, 20, 37);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 44);

    // Add case notes
    doc.setFontSize(14);
    doc.text("Case Notes", 20, 60);
    doc.setFontSize(10);
    caseDetails.notes.forEach((note, index) => {
      const yPos = 70 + index * 20;
      doc.text(`• ${note.content}`, 20, yPos);
      doc.text(
        `  Date: ${new Date(note.date).toLocaleDateString()}`,
        20,
        yPos + 5
      );
    });

    // Add evidence
    doc.setFontSize(14);
    doc.text("Evidence Collection", 20, 120);
    doc.setFontSize(10);

    let currentY = 130;
    const imagePromises: Promise<void>[] = [];

    for (const item of caseDetails.evidence) {
      doc.text(`• Type: ${item.type}`, 20, currentY);
      doc.text(`  Description: ${item.description}`, 20, currentY + 5);

      if (item.file) {
        if (item.file.type.startsWith("image/")) {
          // Create a promise for each image
          const imagePromise = new Promise<void>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              const imgData = e.target?.result as string;
              const img = new Image();
              img.onload = () => {
                const aspectRatio = img.width / img.height;
                const width = 150;
                const height = width / aspectRatio;
                doc.addImage(imgData, "JPEG", 20, currentY + 10, width, height);
                currentY += height + 20;
                resolve();
              };
              img.src = imgData;
            };
            reader.readAsDataURL(item.file!);
          });
          imagePromises.push(imagePromise);
        } else {
          // Handle other file types
          doc.text(
            `  File: ${item.file.name} (See attached files)`,
            20,
            currentY + 10
          );
          currentY += 20;
        }
      }
      currentY += 30;
    }

    // Wait for all images to be processed
    await Promise.all(imagePromises);

    // Add chat history
    doc.setFontSize(14);
    doc.text("Consultation History", 20, currentY + 20);
    doc.setFontSize(10);
    chatHistory.forEach((msg, index) => {
      const yPos = currentY + 30 + index * 20;
      const prefix = msg.type === "user" ? "You: " : "AI: ";
      doc.text(`${prefix}${msg.content}`, 20, yPos);
      doc.text(`  ${new Date(msg.timestamp).toLocaleString()}`, 20, yPos + 5);
    });

    // Add key rights
    doc.setFontSize(14);
    doc.text("Key Rights", 20, currentY + 200);
    doc.setFontSize(10);
    const rights = [
      "Right to fair housing and protection against discrimination",
      "Right to a habitable living space",
      "Right to privacy and proper notice before landlord entry",
    ];
    rights.forEach((right, index) => {
      doc.text(`• ${right}`, 20, currentY + 210 + index * 10);
    });

    // Save the PDF
    doc.save(
      `case-summary-${topic.toLowerCase().replace(/\s+/g, "-")}-${
        new Date().toISOString().split("T")[0]
      }.pdf`
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">Your Case Summary</h2>
        <p className="mt-2 text-sm text-muted">
          Overview of your case and next steps
        </p>
      </div>

      <div className="card">
        {/* Case Notes */}
        <section>
          <h3 className="section-title">Case Notes</h3>
          <div className="space-y-2">
            {caseDetails.notes.map((note) => (
              <div key={note.id} className="message-bubble">
                <p className="text-sm text-foreground">{note.content}</p>
                <p className="text-xs text-muted mt-1">
                  {new Date(note.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Evidence and Documents */}
        <section>
          <h3 className="section-title">Evidence Collection</h3>
          <div className="space-y-2">
            {caseDetails.evidence.map((item) => (
              <div key={item.id} className="message-bubble">
                <h4 className="font-medium text-foreground">{item.type}</h4>
                <p className="text-sm text-foreground mt-1">
                  {item.description}
                </p>
              </div>
            ))}
            {caseDetails.documents.map((doc) => (
              <div key={doc.id} className="message-bubble flex items-center">
                <Paperclip className="h-4 w-4 text-muted mr-2" />
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {doc.name}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Key Rights */}
        <section>
          <h3 className="section-title">Your Key Rights</h3>
          <ul className="space-y-3 text-sm text-foreground">
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-primary rounded-full mr-2"></span>
              <span>
                Right to fair housing and protection against discrimination
              </span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-primary rounded-full mr-2"></span>
              <span>Right to a habitable living space</span>
            </li>
            <li className="flex items-start">
              <span className="flex-shrink-0 w-1.5 h-1.5 mt-2 bg-primary rounded-full mr-2"></span>
              <span>
                Right to privacy and proper notice before landlord entry
              </span>
            </li>
          </ul>
        </section>

        {/* Chat History */}
        <section>
          <h3 className="section-title">Consultation History</h3>
          <div className="space-y-2">
            {chatHistory.map((msg, index) => (
              <div
                key={index}
                className={`${
                  msg.type === "user"
                    ? "message-bubble-user text-white"
                    : "message-bubble-ai text-primary"
                } ${msg.type === "user" ? "ml-4" : "mr-4"}`}
              >
                <p className="text-sm ">{msg.content}</p>
                <p className="text-xs mt-1 opacity-75">
                  {new Date(msg.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Action Buttons */}
        <div className="space-y-3 pt-4 border-t border-border">
          <button onClick={generateCaseFile} className="btn-primary">
            <Download className="h-4 w-4 mr-2" />
            Download Case File
          </button>
          <button className="btn-secondary">
            <Share2 className="h-4 w-4 mr-2" />
            Share with Attorney
          </button>
          <button className="btn-accent">
            <Bell className="h-4 w-4 mr-2" />
            Set Case Reminders
          </button>
          <button onClick={onGoHome} className="btn-neutral">
            <Home className="h-4 w-4 mr-2" />
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Summary;
