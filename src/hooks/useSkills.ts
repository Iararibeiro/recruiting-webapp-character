import { useState, useEffect, useCallback } from 'react';
import { Attributes } from '../types';
import { SKILL_LIST } from '../consts';

export const useSkills = (attributes: Attributes, calculateModifier: (value: number) => number) => {
  const [skillPoints, setSkillPoints] = useState<Record<string, number>>({});
  const [totalPointsSpent, setTotalPointsSpent] = useState(0);

  const loadSkillPoints = useCallback((savedSkillPoints: Record<string, number>) => {
    setSkillPoints(savedSkillPoints);
  }, []);

  // Calculate total available points based on Intelligence modifier
  const intelligenceModifier = attributes?.Intelligence ? calculateModifier(attributes.Intelligence) : 0;
  const totalAvailablePoints = Math.max(0, 10 + (4 * intelligenceModifier));

  // Initialize skill points when component mounts
  useEffect(() => {
    const initialSkillPoints: Record<string, number> = {};
    SKILL_LIST.forEach(skill => {
      initialSkillPoints[skill.name] = 0;
    });
    setSkillPoints(initialSkillPoints);
  }, []);

  // Calculate total points spent and validate skill points
  useEffect(() => {
    if (skillPoints && typeof skillPoints === 'object') {
      const spent = Object.values(skillPoints).reduce((sum, points) => sum + points, 0);
      setTotalPointsSpent(spent);
      
      // If Intelligence was reduced and we have more points than allowed, reset to maximum
      if (spent > totalAvailablePoints) {
        const adjustedSkillPoints: Record<string, number> = {};
        let remainingPoints = totalAvailablePoints;
        
        // Distribute points evenly or reset to 0 if not enough
        Object.keys(skillPoints).forEach(skillName => {
          if (remainingPoints > 0) {
            adjustedSkillPoints[skillName] = Math.min(skillPoints[skillName], remainingPoints);
            remainingPoints -= adjustedSkillPoints[skillName];
          } else {
            adjustedSkillPoints[skillName] = 0;
          }
        });
        
        setSkillPoints(adjustedSkillPoints);
      }
    } else {
      setTotalPointsSpent(0);
    }
  }, [skillPoints, totalAvailablePoints]);

  const addSkillPoint = (skillName: string) => {
    setSkillPoints(prev => {
      const currentTotal = Object.values(prev).reduce((sum, points) => sum + points, 0);
      if (currentTotal < totalAvailablePoints) {
        return {
          ...prev,
          [skillName]: (prev[skillName] || 0) + 1
        };
      }
      return prev;
    });
  };

  const removeSkillPoint = (skillName: string) => {
    setSkillPoints(prev => {
      const current = prev[skillName] || 0;
      if (current > 0) {
        return {
          ...prev,
          [skillName]: current - 1
        };
      }
      return prev;
    });
  };

  const getSkillModifier = (skillName: string) => {
    const skill = SKILL_LIST.find(s => s.name === skillName);
    if (!skill) return 0;
    
    const attributeValue = attributes?.[skill.attributeModifier as keyof Attributes];
    if (attributeValue === undefined) return 0;
    
    const attributeModifier = calculateModifier(attributeValue);
    const skillPointsInvested = skillPoints[skillName] || 0;
    
    return attributeModifier + skillPointsInvested;
  };

  const getRemainingPoints = () => {
    return totalAvailablePoints - totalPointsSpent;
  };

  return {
    skillPoints,
    totalAvailablePoints,
    remainingPoints: getRemainingPoints(),
    addSkillPoint,
    removeSkillPoint,
    getSkillModifier,
    loadSkillPoints
  };
}; 