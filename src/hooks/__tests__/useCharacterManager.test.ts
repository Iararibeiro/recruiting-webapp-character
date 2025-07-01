import { renderHook, act, waitFor } from '@testing-library/react';
import { useCharacterManager } from '../useCharacterManager';
import * as characterApi from '../../services/characterApi';

// Mock the character API
jest.mock('../../services/characterApi');
const mockCharacterApi = characterApi as jest.Mocked<typeof characterApi>;

// Mock the characterApi object
const mockLoadCharacter = jest.fn();
const mockSaveCharacter = jest.fn();

(mockCharacterApi.characterApi as any) = {
  loadCharacter: mockLoadCharacter,
  saveCharacter: mockSaveCharacter,
};

describe('useCharacterManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage
    localStorage.clear();
  });

  describe('initialization', () => {
    it('should initialize with empty characters array', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      expect(result.current.characters).toEqual([]);
      expect(result.current.currentCharacterId).toBeNull();
      expect(result.current.currentCharacter).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('createCharacter', () => {
    it('should create a new character with default attributes', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('New Character');
      });
      
      expect(result.current.characters).toHaveLength(1);
      expect(result.current.characters[0].name).toBe('New Character');
      expect(result.current.characters[0].attributes).toEqual({
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10,
      });
      expect(result.current.characters[0].skillPoints).toEqual({});
      expect(result.current.currentCharacterId).toBe(result.current.characters[0].id);
    });

    it('should create multiple characters', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Character 1');
        result.current.createCharacter('Character 2');
      });
      
      expect(result.current.characters).toHaveLength(2);
      expect(result.current.characters[0].name).toBe('Character 1');
      expect(result.current.characters[1].name).toBe('Character 2');
      expect(result.current.currentCharacterId).toBe(result.current.characters[1].id);
    });

    it('should return the character ID', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      let characterId: string;
      act(() => {
        characterId = result.current.createCharacter('Test Character');
      });
      
      expect(characterId).toBe(result.current.characters[0].id);
    });
  });

  describe('updateCharacter', () => {
    it('should update character attributes', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      const characterId = result.current.characters[0].id;
      const updates = {
        attributes: {
          Strength: 15,
          Dexterity: 16,
          Constitution: 12,
          Intelligence: 14,
          Wisdom: 10,
          Charisma: 8,
        },
      };
      
      act(() => {
        result.current.updateCharacter(characterId, updates);
      });
      
      expect(result.current.characters[0].attributes).toEqual(updates.attributes);
    });

    it('should update character skill points', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      const characterId = result.current.characters[0].id;
      const updates = {
        skillPoints: {
          'Athletics': 3,
          'Acrobatics': 2,
        },
      };
      
      act(() => {
        result.current.updateCharacter(characterId, updates);
      });
      
      expect(result.current.characters[0].skillPoints).toEqual(updates.skillPoints);
    });

    it('should update character class', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      const characterId = result.current.characters[0].id;
      const updates = {
        selectedClass: 'Wizard' as const,
      };
      
      act(() => {
        result.current.updateCharacter(characterId, updates);
      });
      
      expect(result.current.characters[0].selectedClass).toBe('Wizard');
    });
  });

  describe('getCurrentCharacter', () => {
    it('should return current character', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      expect(result.current.currentCharacter).toEqual(result.current.characters[0]);
    });

    it('should return null when no character is selected', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      expect(result.current.currentCharacter).toBeNull();
    });

    it('should return null when current character is deleted', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      const characterId = result.current.characters[0].id;
      
      act(() => {
        result.current.deleteCharacter(characterId);
      });
      
      expect(result.current.currentCharacter).toBeNull();
    });
  });

  describe('setCurrentCharacterId', () => {
    it('should set current character ID', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Character 1');
        result.current.createCharacter('Character 2');
      });
      
      const characterId = result.current.characters[0].id;
      
      act(() => {
        result.current.setCurrentCharacterId(characterId);
      });
      
      expect(result.current.currentCharacterId).toBe(characterId);
      expect(result.current.currentCharacter).toEqual(result.current.characters[0]);
    });

    it('should set current character ID to null', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      act(() => {
        result.current.setCurrentCharacterId(null);
      });
      
      expect(result.current.currentCharacterId).toBeNull();
      expect(result.current.currentCharacter).toBeNull();
    });
  });

  describe('loadCharacters', () => {
    it('should load character from API successfully', async () => {
      const mockCharacterData = {
        attributes: {
          Strength: 15,
          Dexterity: 14,
          Constitution: 12,
          Intelligence: 16,
          Wisdom: 10,
          Charisma: 8,
        },
        skillPoints: {
          'Athletics': 2,
          'Acrobatics': 1,
        },
        selectedClass: 'Barbarian',
      };
      
      mockLoadCharacter.mockResolvedValue(mockCharacterData);
      
      const { result } = renderHook(() => useCharacterManager());
      
      await act(async () => {
        await result.current.loadCharacters();
      });
      
      expect(mockLoadCharacter).toHaveBeenCalled();
      
      await waitFor(() => {
        expect(result.current.characters).toHaveLength(1);
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].attributes).toEqual(mockCharacterData.attributes);
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].skillPoints).toEqual(mockCharacterData.skillPoints);
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].selectedClass).toBe(mockCharacterData.selectedClass);
      });
      
      await waitFor(() => {
        expect(result.current.currentCharacterId).toBe('1');
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should create default character when API returns empty data', async () => {
      mockLoadCharacter.mockResolvedValue({} as any);
      
      const { result } = renderHook(() => useCharacterManager());
      
      await act(async () => {
        await result.current.loadCharacters();
      });
      
      await waitFor(() => {
        expect(result.current.characters).toHaveLength(1);
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].name).toBe('Character 1');
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].attributes).toEqual({
          Strength: 10,
          Dexterity: 10,
          Constitution: 10,
          Intelligence: 10,
          Wisdom: 10,
          Charisma: 10,
        });
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should create default character when API throws error', async () => {
      mockLoadCharacter.mockRejectedValue(new Error('API Error'));
      
      const { result } = renderHook(() => useCharacterManager());
      
      await act(async () => {
        await result.current.loadCharacters();
      });
      
      await waitFor(() => {
        expect(result.current.characters).toHaveLength(1);
      });
      
      await waitFor(() => {
        expect(result.current.characters[0].name).toBe('Character 1');
      });
      
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe('saveCurrentCharacter', () => {
    it('should save current character successfully', async () => {
      mockSaveCharacter.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      await act(async () => {
        await result.current.saveCurrentCharacter();
      });
      
      expect(mockSaveCharacter).toHaveBeenCalledWith({
        attributes: result.current.currentCharacter!.attributes,
        skillPoints: result.current.currentCharacter!.skillPoints,
        selectedClass: result.current.currentCharacter!.selectedClass,
      });
    });

    it('should not save when no current character', async () => {
      mockSaveCharacter.mockResolvedValue(undefined);
      
      const { result } = renderHook(() => useCharacterManager());
      
      await act(async () => {
        await result.current.saveCurrentCharacter();
      });
      
      expect(mockSaveCharacter).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      mockSaveCharacter.mockRejectedValue(new Error('Save failed'));
      
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
      });
      
      // Should not throw error
      await act(async () => {
        await result.current.saveCurrentCharacter();
      });
      
      expect(mockSaveCharacter).toHaveBeenCalled();
    });
  });

  describe('edge cases', () => {
    it('should handle updating non-existent character', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.updateCharacter('non-existent-id', { name: 'Updated' });
      });
      
      expect(result.current.characters).toHaveLength(0);
    });

    it('should handle deleting non-existent character', () => {
      const { result } = renderHook(() => useCharacterManager());
      
      act(() => {
        result.current.createCharacter('Test Character');
        result.current.deleteCharacter('non-existent-id');
      });
      
      expect(result.current.characters).toHaveLength(1);
    });
  });
}); 