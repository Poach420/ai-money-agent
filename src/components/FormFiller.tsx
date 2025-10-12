import React from "react";

interface FormFillerProps {
  resumeData: any;
  onSubmit: () => void;
  isProcessing: boolean;
}

const FormFiller: React.FC<FormFillerProps> = ({ 
  resumeData, 
  onSubmit, 
  isProcessing 
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-4">Auto-filled Information</h2>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <strong>Name:</strong> {resumeData.name}
        </div>
        <div>
          <strong>Email:</strong> {resumeData.email}
        </div>
        <div>
          <strong>Experience:</strong> {resumeData.experience} years
        </div>
        <div>
          <strong>Skills:</strong> {resumeData.skills.join(", ")}
        </div>
      </div>
      
      <button
        onClick={onSubmit}
        disabled={isProcessing}
        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
      >
        {isProcessing ? "Submitting..." : "Submit Application"}
      </button>
    </div>
  );
};

export default FormFiller;