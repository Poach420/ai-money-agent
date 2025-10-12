// Local storage utilities for resume data persistence
export const saveResumeData = (data: any) => {
  localStorage.setItem('resumeData', JSON.stringify(data));
};

export const loadResumeData = () => {
  const data = localStorage.getItem('resumeData');
  return data ? JSON.parse(data) : null;
};

export const clearResumeData = () => {
  localStorage.removeItem('resumeData');
};