import React from 'react';
import { ATTRIBUTE_LIST } from '../consts';
import { Attributes } from '../types';

interface AttributesSectionProps {
  attributes: Attributes;
  handleAttributeChange: (attribute: keyof Attributes, change: number) => void;
  calculateModifier: (value: number) => number;
  isLoading?: boolean;
  remainingPoints?: number;
}

const AttributesSection: React.FC<AttributesSectionProps> = React.memo(({ attributes, handleAttributeChange, calculateModifier, isLoading = false, remainingPoints }) => {
  // Show loading state if still loading or attributes not available
  if (isLoading || !attributes) {
    return (
      <div className="attribute-section">
        <h2>Character Attributes</h2>
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading attributes...
        </div>
      </div>
    );
  }

  return (
    <div className="attribute-section">
      <h2>Character Attributes</h2>
      {remainingPoints !== undefined && (
        <div className="attribute-points-info">
          <p>Attribute Points Remaining: <strong>{remainingPoints}</strong> / 70</p>
        </div>
      )}
      <div className="attributes-grid">
        {ATTRIBUTE_LIST.map((attributeName) => {
          const attributeValue = attributes[attributeName as keyof Attributes];
          const modifier = calculateModifier(attributeValue);
          
          return (
            <div key={attributeName} className="attribute-card">
              <h3 className="attribute-name">{attributeName}</h3>
              <div className="attribute-value">{attributeValue}</div>
              <div className="attribute-modifier">
                {modifier >= 0 ? '+' : ''}{modifier}
              </div>
              <div className="attribute-controls">
                <button 
                  onClick={() => handleAttributeChange(attributeName as keyof Attributes, -1)}
                  className="attribute-btn decrement"
                  aria-label={`Decrease ${attributeName}`}
                >
                  -
                </button>
                <button 
                  onClick={() => handleAttributeChange(attributeName as keyof Attributes, 1)}
                  className="attribute-btn increment"
                  aria-label={`Increase ${attributeName}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default AttributesSection; 