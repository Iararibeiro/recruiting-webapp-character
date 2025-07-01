import React, { useEffect, useCallback, useMemo } from 'react';
import { useCharacterManager } from './hooks/useCharacterManager';
import { Class, Attributes } from './types';
import './App.css';
import { SKILL_LIST } from './consts';

// Components
import CharacterSelector from './Components/CharacterSelector';
import AttributesSection from './Components/AttributesSection';
import ClassSection from './Components/ClassSection';
import SkillsSection from './Components/SkillsSection';

function App() {
  const {
    characters,
    currentCharacterId,
    currentCharacter,
    isLoading,
    createCharacter,
    deleteCharacter,
    updateCharacter,
    setCurrentCharacterId,
    loadCharacters,
    saveCurrentCharacter,
  } = useCharacterManager();

  // Load characters on mount
  useEffect(() => {
    loadCharacters();
  }, [loadCharacters]);

  // Character management handlers
  const handleCharacterSelect = useCallback((characterId: string) => {
    setCurrentCharacterId(characterId);
  }, [setCurrentCharacterId]);

  const handleCreateCharacter = useCallback((name: string) => {
    createCharacter(name);
  }, [createCharacter]);

  const handleDeleteCharacter = useCallback((characterId: string) => {
    deleteCharacter(characterId);
  }, [deleteCharacter]);

  const handleCharacterNameChange = useCallback((characterId: string, name: string) => {
    updateCharacter(characterId, { name });
  }, [updateCharacter]);

  // Character data handlers - memoized to prevent unnecessary re-renders
  const calculateModifier = useCallback((value: number) => Math.floor((value - 10) / 2), []);

  const handleAttributeChange = useCallback((attribute: keyof Attributes, change: number) => {
    if (!currentCharacter) return;
    
    const newAttributes = { ...currentCharacter.attributes };
    const newValue = newAttributes[attribute] + change;
    
    // Don't allow negative values
    if (newValue < 0) return;
    
    // Calculate current total excluding the attribute being changed
    const currentTotal = Object.entries(newAttributes).reduce((sum, [key, value]) => {
      if (key === attribute) return sum;
      return sum + value;
    }, 0);
    
    // Check if the new total would exceed 70
    if (currentTotal + newValue > 70) return;
    
    newAttributes[attribute] = newValue;
    updateCharacter(currentCharacter.id, { attributes: newAttributes });
  }, [currentCharacter, updateCharacter]);

  const getTotalAttributes = useCallback(() => {
    if (!currentCharacter) return 0;
    return Object.values(currentCharacter.attributes).reduce((sum, value) => sum + value, 0);
  }, [currentCharacter]);

  const getRemainingPoints = useCallback(() => {
    return 70 - getTotalAttributes();
  }, [getTotalAttributes]);

  const handleSkillPointChange = useCallback((skillName: string, change: number) => {
    if (!currentCharacter) return;
    
    const newSkillPoints = { ...currentCharacter.skillPoints };
    const currentPoints = newSkillPoints[skillName] || 0;
    const newPoints = currentPoints + change;
    
    if (newPoints < 0) return;
    
    // Calculate total skill points
    const totalSkillPoints = Object.values(newSkillPoints).reduce((sum, points) => sum + points, 0) - currentPoints + newPoints;
    const intelligenceModifier = calculateModifier(currentCharacter.attributes.Intelligence);
    const maxSkillPoints = Math.max(0, 10 + (4 * intelligenceModifier));
    
    if (totalSkillPoints > maxSkillPoints) return;
    
    newSkillPoints[skillName] = newPoints;
    updateCharacter(currentCharacter.id, { skillPoints: newSkillPoints });
  }, [currentCharacter, calculateModifier, updateCharacter]);

  const getSkillModifier = useCallback((skillName: string) => {
    if (!currentCharacter) return 0;
    
    const skill = SKILL_LIST.find(s => s.name === skillName);
    if (!skill) return 0;
    
    const attributeValue = currentCharacter.attributes[skill.attributeModifier as keyof Attributes];
    const attributeModifier = calculateModifier(attributeValue);
    const skillPointsInvested = currentCharacter.skillPoints[skillName] || 0;
    
    return attributeModifier + skillPointsInvested;
  }, [currentCharacter, calculateModifier]);

  const handleClassChange = useCallback((selectedClass: Class | null) => {
    if (!currentCharacter) return;
    updateCharacter(currentCharacter.id, { selectedClass });
  }, [currentCharacter, updateCharacter]);

  // Calculate skill points info - memoized
  const skillPointsInfo = useMemo(() => {
    if (!currentCharacter) {
      return {
        intelligenceModifier: 0,
        totalAvailableSkillPoints: 10,
        totalSkillPointsSpent: 0,
        remainingSkillPoints: 10
      };
    }
    
    const intelligenceModifier = calculateModifier(currentCharacter.attributes.Intelligence);
    const totalAvailableSkillPoints = Math.max(0, 10 + (4 * intelligenceModifier));
    const totalSkillPointsSpent = Object.values(currentCharacter.skillPoints).reduce((sum, points) => sum + points, 0);
    const remainingSkillPoints = totalAvailableSkillPoints - totalSkillPointsSpent;
    
    return {
      intelligenceModifier,
      totalAvailableSkillPoints,
      totalSkillPointsSpent,
      remainingSkillPoints
    };
  }, [currentCharacter, calculateModifier]);

  const { totalAvailableSkillPoints, remainingSkillPoints } = skillPointsInfo;

  // If no current character, show character selector
  if (!currentCharacter) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>React Coding Exercise - Iara Ribeiro</h1>
        </header>
        <main className="character-sheet">
          <div style={{ textAlign: 'center', color: 'white', padding: '20px' }}>
            {isLoading ? 'Loading characters...' : 'No characters found. Create one to get started!'}
          </div>
        </main>
      </div>
    );
  }



  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise - Iara Ribeiro</h1>
      </header>
      <main className="character-sheet">
        <div className="character-sheet-left">
          <CharacterSelector
            characters={characters}
            currentCharacterId={currentCharacterId}
            onCharacterSelect={handleCharacterSelect}
            onCreateCharacter={handleCreateCharacter}
            onDeleteCharacter={handleDeleteCharacter}
            onCharacterNameChange={handleCharacterNameChange}
            onSaveCharacter={saveCurrentCharacter}
            isLoading={isLoading}
          />
          <AttributesSection
            attributes={currentCharacter.attributes}
            handleAttributeChange={handleAttributeChange}
            calculateModifier={calculateModifier}
            isLoading={isLoading}
            remainingPoints={getRemainingPoints()}
          />
        </div>
        <div className="character-sheet-right">
          <ClassSection 
            attributes={currentCharacter.attributes}
            selectedClass={currentCharacter.selectedClass}
            setSelectedClass={handleClassChange}
            isLoading={isLoading}
          />
          <SkillsSection
            attributes={currentCharacter.attributes}
            calculateModifier={calculateModifier}
            skillPoints={currentCharacter.skillPoints}
            addSkillPoint={(skillName) => handleSkillPointChange(skillName, 1)}
            removeSkillPoint={(skillName) => handleSkillPointChange(skillName, -1)}
            getSkillModifier={getSkillModifier}
            remainingPoints={remainingSkillPoints}
            totalAvailablePoints={totalAvailableSkillPoints}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
