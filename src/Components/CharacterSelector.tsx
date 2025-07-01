import React, { useState } from 'react';
import { Character } from '../types';

interface CharacterSelectorProps {
  characters: Character[];
  currentCharacterId: string | null;
  onCharacterSelect: (characterId: string) => void;
  onCreateCharacter: (name: string) => void;
  onDeleteCharacter: (characterId: string) => void;
  onCharacterNameChange: (characterId: string, name: string) => void;
  onSaveCharacter: () => void;
  isLoading?: boolean;
}

const CharacterSelector: React.FC<CharacterSelectorProps> = React.memo(({
  characters,
  currentCharacterId,
  onCharacterSelect,
  onCreateCharacter,
  onDeleteCharacter,
  onCharacterNameChange,
  onSaveCharacter,
  isLoading = false,
}) => {
  const [newCharacterName, setNewCharacterName] = useState('');
  const [editingName, setEditingName] = useState<string | null>(null);
  const [editingNameValue, setEditingNameValue] = useState('');

  const handleCreateCharacter = () => {
    if (newCharacterName.trim()) {
      onCreateCharacter(newCharacterName.trim());
      setNewCharacterName('');
    }
  };

  const handleStartEditName = (character: Character) => {
    setEditingName(character.id);
    setEditingNameValue(character.name);
  };

  const handleSaveName = () => {
    if (editingName && editingNameValue.trim()) {
      onCharacterNameChange(editingName, editingNameValue.trim());
      setEditingName(null);
      setEditingNameValue('');
    }
  };

  const handleCancelEdit = () => {
    setEditingName(null);
    setEditingNameValue('');
  };

  return (
    <div className="character-selector">
      <h3>Characters</h3>
      
      <div className="character-list">
        {characters.map((character) => (
          <div 
            key={character.id} 
            className={`character-item ${character.id === currentCharacterId ? 'active' : ''}`}
          >
            <div className="character-info">
              {editingName === character.id ? (
                <div className="name-edit">
                  <input
                    type="text"
                    value={editingNameValue}
                    onChange={(e) => setEditingNameValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="save-btn">✓</button>
                  <button onClick={handleCancelEdit} className="cancel-btn">✗</button>
                </div>
              ) : (
                <div className="character-name">
                  <span onClick={() => onCharacterSelect(character.id)}>
                    {character.name}
                  </span>
                  <button 
                    onClick={() => handleStartEditName(character)}
                    className="edit-btn"
                    aria-label="Edit character name"
                  >
                    ✎
                  </button>
                </div>
              )}
            </div>
            
            <div className="character-actions">
              <button
                onClick={() => onCharacterSelect(character.id)}
                className={`select-btn ${character.id === currentCharacterId ? 'selected' : ''}`}
              >
                {character.id === currentCharacterId ? 'Current' : 'Select'}
              </button>
              {characters.length > 1 && (
                <button
                  onClick={() => onDeleteCharacter(character.id)}
                  className="delete-btn"
                  aria-label="Delete character"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="create-character">
        <input
          type="text"
          value={newCharacterName}
          onChange={(e) => setNewCharacterName(e.target.value)}
          placeholder="New character name"
          onKeyPress={(e) => e.key === 'Enter' && handleCreateCharacter()}
        />
        <button onClick={handleCreateCharacter} disabled={!newCharacterName.trim()}>
          Create Character
        </button>
      </div>
      
      <div className="character-actions-bottom">
        <button 
          onClick={onSaveCharacter}
          className="save-character-btn"
          disabled={isLoading || !currentCharacterId}
        >
          Save Character
        </button>
      </div>
    </div>
  );
});

export default CharacterSelector; 