import React, { useState } from "react";
import ResumeUploader from "./ResumeUploader";
import FormFiller from "./FormFiller";

const JobApplicationAgent: React.FC = () => {
  const [resumeData, setResumeData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [completionStatus, setCompletionStatus] = useState("");

  const handleResumeProcessed = (data) => {
    setResumeData(data);
    setCompletionStatus("Resume parsed successfully!");
  };

  const handleFormSubmission = async () => {
    setIsProcessing(true);
    try {
      // Here you would integrate with actual job application APIs
      // For now, we'll simulate successful submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      setCompletionStatus("Application submitted successfully!");
    } catch (error) {
      setCompletionStatus("Error submitting application");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">AI Job Application Agent</h1>
      
      <ResumeUploader onResumeProcessed={handleResumeProcessed} />
      
      {resumeData && (
        <FormFiller 
          resumeData={resumeData} 
          onSubmit={handleFormSubmission}
          isProcessing={isProcessing}
        />
      )}
      
      {completionStatus && (
        <div className="mt-4 p-4 bg-green-100 rounded-md">
          {completionStatus}
        </div>
      )}
    </div>
  );
};

export default JobApplicationAgent;