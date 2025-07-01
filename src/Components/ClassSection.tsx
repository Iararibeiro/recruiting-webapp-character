import React from 'react';
import { CLASS_LIST } from '../consts';
import { Attributes, Class } from '../types';

interface ClassSectionProps {
  attributes: Attributes;
  selectedClass: Class | null;
  setSelectedClass: (className: Class | null) => void;
  isLoading?: boolean;
}

const ClassSection: React.FC<ClassSectionProps> = React.memo(({ attributes, selectedClass, setSelectedClass, isLoading = false }) => {

  // Show loading state if still loading or attributes not available
  if (isLoading || !attributes) {
    return (
      <div className="class-section">
        <h2>Classes</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading classes...
        </div>
      </div>
    );
  }

  // Helper to check if requirements are met
  const meetsRequirements = (className: Class): boolean => {
    const requirements = CLASS_LIST[className];
    return Object.entries(requirements).every(
      ([attr, min]) => attributes[attr as keyof Attributes] >= min
    );
  };

  const handleClassClick = (className: Class) => {
    setSelectedClass(selectedClass === className ? null : className);
  };

  return (
    <div className="class-section">
      <h2>Classes</h2>
      <div className="classes-grid">
        {(Object.keys(CLASS_LIST) as Class[]).map((className) => {
          const available = meetsRequirements(className);
          const isSelected = selectedClass === className;
          
          return (
            <div
              key={className}
              className={`class-card${available ? ' available' : ' unavailable'}${isSelected ? ' selected' : ''}`}
              onClick={() => handleClassClick(className)}
            >
              <h3>{className}</h3>
              <div className="class-status">
                {available ? 'Available' : 'Unavailable'}
              </div>
              
              {isSelected && (
                <div className="class-requirements-detail">
                  <h4>Minimum Requirements:</h4>
                  <ul className="class-requirements">
                    {Object.entries(CLASS_LIST[className]).map(([attr, min]) => {
                      const currentValue = attributes[attr as keyof Attributes];
                      const meetsRequirement = currentValue >= min;
                      
                      return (
                        <li key={attr} className={meetsRequirement ? 'met' : 'not-met'}>
                          <span className="requirement-attr">{attr}:</span>
                          <span className="requirement-current">{currentValue}</span>
                          <span className="requirement-separator">/</span>
                          <span className="requirement-minimum">{min}</span>
                          {meetsRequirement && <span className="requirement-check">✓</span>}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default ClassSection; 