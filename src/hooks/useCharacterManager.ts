import { useState, useCallback } from 'react';
import { Character, CharacterData, Class } from '../types';
import { characterApi } from '../services/characterApi';

export const useCharacterManager = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [currentCharacterId, setCurrentCharacterId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const createCharacter = useCallback((name: string) => {
    const newCharacter: Character = {
      id: Date.now().toString(),
      name,
      attributes: {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10,
      },
      skillPoints: {},
    };

    setCharacters(prev => [...prev, newCharacter]);
    setCurrentCharacterId(newCharacter.id);
    return newCharacter.id;
  }, []);

  const deleteCharacter = useCallback((characterId: string) => {
    setCharacters(prev => {
      const filtered = prev.filter(char => char.id !== characterId);
      if (currentCharacterId === characterId && filtered.length > 0) {
        setCurrentCharacterId(filtered[0].id);
      } else if (filtered.length === 0) {
        setCurrentCharacterId(null);
      }
      return filtered;
    });
  }, [currentCharacterId]);

  const updateCharacter = useCallback((characterId: string, updates: Partial<Character>) => {
    setCharacters(prev => 
      prev.map(char => 
        char.id === characterId ? { ...char, ...updates } : char
      )
    );
  }, []);

  const getCurrentCharacter = useCallback(() => {
    return characters.find(char => char.id === currentCharacterId) || null;
  }, [characters, currentCharacterId]);

  const loadCharacters = useCallback(async () => {
    setIsLoading(true);
    try {
      // For now, we'll load a single character from the API and convert it
      // In a real implementation, you'd have an API endpoint for multiple characters
      const savedCharacter = await characterApi.loadCharacter();
      if (savedCharacter && savedCharacter.attributes && Object.keys(savedCharacter.attributes).length > 0) {
        const character: Character = {
          id: '1',
          name: 'Character 1',
          attributes: savedCharacter.attributes,
          skillPoints: savedCharacter.skillPoints || {},
          selectedClass: savedCharacter.selectedClass as Class,
        };
        setCharacters([character]);
        setCurrentCharacterId(character.id);
      } else {
        // Create a default character if none exists
        const newCharacter: Character = {
          id: Date.now().toString(),
          name: 'Character 1',
          attributes: {
            Strength: 10,
            Dexterity: 10,
            Constitution: 10,
            Intelligence: 10,
            Wisdom: 10,
            Charisma: 10,
          },
          skillPoints: {},
        };
        setCharacters([newCharacter]);
        setCurrentCharacterId(newCharacter.id);
      }
    } catch (error) {
      console.error('Failed to load characters:', error);
      // Create a default character on error
      const newCharacter: Character = {
        id: Date.now().toString(),
        name: 'Character 1',
        attributes: {
          Strength: 10,
          Dexterity: 10,
          Constitution: 10,
          Intelligence: 10,
          Wisdom: 10,
          Charisma: 10,
        },
        skillPoints: {},
      };
      setCharacters([newCharacter]);
      setCurrentCharacterId(newCharacter.id);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCurrentCharacter = useCallback(async () => {
    const currentCharacter = getCurrentCharacter();
    if (!currentCharacter) return;

    try {
      const characterData: CharacterData = {
        attributes: currentCharacter.attributes,
        skillPoints: currentCharacter.skillPoints,
        selectedClass: currentCharacter.selectedClass,
      };
      
      await characterApi.saveCharacter(characterData);
      console.log('Character saved successfully');
    } catch (error) {
      console.error('Failed to save character:', error);
    }
  }, [getCurrentCharacter]);

  return {
    characters,
    currentCharacterId,
    currentCharacter: getCurrentCharacter(),
    isLoading,
    createCharacter,
    deleteCharacter,
    updateCharacter,
    setCurrentCharacterId,
    loadCharacters,
    saveCurrentCharacter,
  };
}; 