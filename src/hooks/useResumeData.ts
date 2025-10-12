import { useState, useEffect } from 'react';
import { loadResumeData } from '@/lib/storage';

export const useResumeData = () => {
  const [resumeData, setResumeData] = useState<any>(null);

  useEffect(() => {
    const data = loadResumeData();
    if (data) {
      setResumeData(data);
    }
  }, []);

  return { resumeData, setResumeData };
};