import React, { useState, useRef } from "react";

interface ResumeUploaderProps {
  onResumeProcessed: (data: any) => void;
}

const ResumeUploader: React.FC<ResumeUploaderProps> = ({ onResumeProcessed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (typeof text === "string") {
        // Parse resume data (simplified example)
        const resumeData = {
          name: extractName(text),
          email: extractEmail(text),
          experience: extractExperience(text),
          skills: extractSkills(text)
        };
        onResumeProcessed(resumeData);
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        className="cursor-pointer"
      >
        <p>Drag & drop your resume here or</p>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-blue-600 hover:text-blue-800 underline"
        >
          browse files
        </button>
      </div>
    </div>
  );
};

// Helper functions (simplified examples)
const extractName = (text: string) => text.split("\n")[0]?.trim() || "";
const extractEmail = (text: string) => text.match(/\S+@\S+\.\S+/)?.[0] || "";
const extractExperience = (text: string) => {
  const match = text.match(/(\d+)\s*years/);
  return match ? parseInt(match[1]) : 0;
};
const extractSkills = (text: string) => {
  const skills = ["JavaScript", "React", "Python", "SQL"];
  return skills.filter(skill => text.toLowerCase().includes(skill.toLowerCase()));
};

export default ResumeUploader;