import { useState, useCallback } from 'react';
import { Class } from '../types';

export const useClass = () => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const loadSelectedClass = useCallback((savedClass: Class | null) => {
    setSelectedClass(savedClass);
  }, []);

  return {
    selectedClass,
    setSelectedClass,
    loadSelectedClass
  };
}; 