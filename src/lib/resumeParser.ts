// Advanced resume parsing utilities
export const extractName = (text: string): string => {
  // Extract name using regex patterns
  const nameMatch = text.match(/^([A-Za-z]+ [A-Za-z]+)/);
  return nameMatch ? nameMatch[0] : "Unknown";
};

export const extractEmail = (text: string): string => {
  const emailMatch = text.match(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i);
  return emailMatch ? emailMatch[0] : "";
};

export const extractExperience = (text: string): number => {
  const experienceMatch = text.match(/(\d+)(?:\+)?\s*(?:years?|yrs?)/i);
  return experienceMatch ? parseInt(experienceMatch[1]) : 0;
};

export const extractSkills = (text: string): string[] => {
  const commonSkills = [
    "JavaScript", "React", "Python", "SQL", "Java", "C++", "AWS", "Azure"
  ];
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
};