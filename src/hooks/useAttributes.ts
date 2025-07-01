import { useState, useCallback } from 'react';
import { Attributes } from '../types';

const INITIAL_ATTRIBUTES: Attributes = {
  Strength: 10,
  Dexterity: 10,
  Constitution: 10,
  Intelligence: 10,
  Wisdom: 10,
  Charisma: 10,
};

export function useAttributes(initial: Attributes = INITIAL_ATTRIBUTES) {
  const [attributes, setAttributes] = useState<Attributes>(initial);
  const [isLoading, setIsLoading] = useState(true);

  const handleAttributeChange = (attribute: keyof Attributes, change: number) => {
    setAttributes(prev => {
      const newValue = prev[attribute] + change;
      
      // Don't allow negative values
      if (newValue < 0) {
        return prev;
      }
      
      // Calculate current total excluding the attribute being changed
      const currentTotal = Object.entries(prev).reduce((sum, [key, value]) => {
        if (key === attribute) return sum;
        return sum + value;
      }, 0);
      
      // Check if the new total would exceed 70
      if (currentTotal + newValue > 70) {
        return prev;
      }
      
      return {
        ...prev,
        [attribute]: newValue,
      };
    });
  };

  const calculateModifier = (value: number) => Math.floor((value - 10) / 2);

  const getTotalAttributes = useCallback(() => {
    return Object.values(attributes).reduce((sum, value) => sum + value, 0);
  }, [attributes]);

  const getRemainingPoints = useCallback(() => {
    return 70 - getTotalAttributes();
  }, [getTotalAttributes]);

  const loadAttributes = useCallback((savedAttributes: Attributes) => {
    setAttributes(savedAttributes);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return { 
    attributes, 
    handleAttributeChange, 
    calculateModifier, 
    loadAttributes, 
    isLoading, 
    setLoading,
    getTotalAttributes,
    getRemainingPoints
  };
} 