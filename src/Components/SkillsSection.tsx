import React from 'react';
import { SKILL_LIST } from '../consts';
import { Attributes } from '../types';

interface SkillsSectionProps {
  attributes: Attributes;
  calculateModifier: (value: number) => number;
  skillPoints: Record<string, number>;
  addSkillPoint: (skillName: string) => void;
  removeSkillPoint: (skillName: string) => void;
  getSkillModifier: (skillName: string) => number;
  remainingPoints: number;
  totalAvailablePoints: number;
  isLoading?: boolean;
}

const SkillsSection: React.FC<SkillsSectionProps> = React.memo(({ 
  attributes, 
  calculateModifier, 
  skillPoints, 
  addSkillPoint, 
  removeSkillPoint, 
  getSkillModifier, 
  remainingPoints, 
  totalAvailablePoints,
  isLoading = false
}) => {

  // Show loading state if still loading or attributes not available
  if (isLoading || !attributes) {
    return (
      <div className="skills-section">
        <h2>Skills</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading skills...
        </div>
      </div>
    );
  }

  return (
    <div className="skills-section">
      <h2>Skills</h2>
      <div className="skill-points-info">
        <p>Skill Points Available: <strong>{remainingPoints}</strong> / {totalAvailablePoints}</p>
      </div>
      <div className="skills-list">
        {SKILL_LIST.map((skill) => {
          const skillModifier = getSkillModifier(skill.name);
          const pointsInvested = skillPoints[skill.name] || 0;
          const canAddPoint = remainingPoints > 0;
          const canRemovePoint = pointsInvested > 0;
          const attributeModifier = calculateModifier(attributes[skill.attributeModifier as keyof Attributes]);
          
          return (
            <div key={skill.name} className="skill-row">
              <span className="skill-name">{skill.name}</span>
              <span className="skill-points-section">
                points: {pointsInvested}
                <button 
                  className="skill-btn increment"
                  onClick={() => addSkillPoint(skill.name)}
                  disabled={!canAddPoint}
                  aria-label={`Add point to ${skill.name}`}
                >
                  +
                </button>
                <button 
                  className="skill-btn decrement"
                  onClick={() => removeSkillPoint(skill.name)}
                  disabled={!canRemovePoint}
                  aria-label={`Remove point from ${skill.name}`}
                >
                  -
                </button>
              </span>
              <span className="skill-modifier-section">
                modifier ({skill.attributeModifier.substring(0, 3)}): {attributeModifier >= 0 ? '+' : ''}{attributeModifier}
              </span>
              <span className="skill-total">
                total: {skillModifier >= 0 ? '+' : ''}{skillModifier}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default SkillsSection; 