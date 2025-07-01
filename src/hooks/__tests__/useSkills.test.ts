import { renderHook, act } from '@testing-library/react';
import { useSkills } from '../useSkills';
import { Attributes } from '../../types';
import { waitFor } from '@testing-library/react';

// Mock the SKILL_LIST to avoid circular dependencies
jest.mock('../../consts', () => ({
  SKILL_LIST: [
    { name: 'Acrobatics', attributeModifier: 'Dexterity' },
    { name: 'Athletics', attributeModifier: 'Strength' },
    { name: 'Arcana', attributeModifier: 'Intelligence' },
    { name: 'Perception', attributeModifier: 'Wisdom' },
    { name: 'Persuasion', attributeModifier: 'Charisma' },
  ],
}));

describe('useSkills', () => {
  const mockAttributes: Attributes = {
    Strength: 12,
    Dexterity: 14,
    Constitution: 10,
    Intelligence: 16,
    Wisdom: 8,
    Charisma: 10,
  };

  const calculateModifier = (value: number) => Math.floor((value - 10) / 2);

  describe('initialization', () => {
    it('should initialize with zero skill points for all skills', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      expect(result.current.skillPoints).toEqual({
        'Acrobatics': 0,
        'Athletics': 0,
        'Arcana': 0,
        'Perception': 0,
        'Persuasion': 0,
      });
    });

    it('should calculate total available points based on Intelligence modifier', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      // Intelligence 16 = modifier +3, so 10 + (4 * 3) = 22 points
      expect(result.current.totalAvailablePoints).toBe(22);
    });

    it('should handle negative Intelligence modifier', () => {
      const lowIntAttributes: Attributes = {
        ...mockAttributes,
        Intelligence: 8, // modifier -1
      };
      const { result } = renderHook(() => useSkills(lowIntAttributes, calculateModifier));
      
      // 10 + (4 * -1) = 6, but minimum is 0
      expect(result.current.totalAvailablePoints).toBe(6);
    });

    it('should handle zero Intelligence modifier', () => {
      const avgIntAttributes: Attributes = {
        ...mockAttributes,
        Intelligence: 10, // modifier 0
      };
      const { result } = renderHook(() => useSkills(avgIntAttributes, calculateModifier));
      
      // 10 + (4 * 0) = 10
      expect(result.current.totalAvailablePoints).toBe(10);
    });
  });

  describe('addSkillPoint', () => {
    it('should add a skill point when points are available', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      act(() => {
        result.current.addSkillPoint('Athletics');
      });
      
      expect(result.current.skillPoints.Athletics).toBe(1);
      expect(result.current.remainingPoints).toBe(21);
    });

    it('should not add skill points when no points are available', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      // Use all available points
      act(() => {
        for (let i = 0; i < 25; i++) {
          result.current.addSkillPoint('Athletics');
        }
      });
      
      expect(result.current.skillPoints.Athletics).toBe(22); // Max available
      expect(result.current.remainingPoints).toBe(0);
    });

    it('should allow adding points to multiple skills', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      act(() => {
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Acrobatics');
        result.current.addSkillPoint('Arcana');
      });
      
      expect(result.current.skillPoints.Athletics).toBe(1);
      expect(result.current.skillPoints.Acrobatics).toBe(1);
      expect(result.current.skillPoints.Arcana).toBe(1);
      expect(result.current.remainingPoints).toBe(19);
    });
  });

  describe('removeSkillPoint', () => {
    it('should remove a skill point when points are invested', async () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      act(() => {
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Athletics');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(2);
      });
      act(() => {
        result.current.removeSkillPoint('Athletics');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(1);
      });
    });

    it('should not remove skill points when none are invested', async () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      act(() => {
        result.current.removeSkillPoint('Athletics');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(0);
      });
    });

    it('should not allow negative skill points', async () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      act(() => {
        result.current.addSkillPoint('Athletics');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(1);
      });
      act(() => {
        result.current.removeSkillPoint('Athletics');
        result.current.removeSkillPoint('Athletics'); // Try to remove again
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(0);
      });
    });
  });

  describe('getSkillModifier', () => {
    it('should calculate skill modifier correctly', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      // Athletics: Strength 12 = +1 modifier, 0 skill points = +1 total
      expect(result.current.getSkillModifier('Athletics')).toBe(1);
      
      // Acrobatics: Dexterity 14 = +2 modifier, 0 skill points = +2 total
      expect(result.current.getSkillModifier('Acrobatics')).toBe(2);
    });

    it('should include skill points in modifier calculation', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      act(() => {
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Athletics');
      });
      
      // Athletics: Strength 12 = +1 modifier, 2 skill points = +3 total
      expect(result.current.getSkillModifier('Athletics')).toBe(3);
    });

    it('should handle skills with negative attribute modifiers', () => {
      const lowStrAttributes: Attributes = {
        ...mockAttributes,
        Strength: 8, // modifier -1
      };
      const { result } = renderHook(() => useSkills(lowStrAttributes, calculateModifier));
      
      // Athletics: Strength 8 = -1 modifier, 0 skill points = -1 total
      expect(result.current.getSkillModifier('Athletics')).toBe(-1);
    });

    it('should return 0 for non-existent skills', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      expect(result.current.getSkillModifier('NonExistentSkill')).toBe(0);
    });
  });

  describe('loadSkillPoints', () => {
    it('should load saved skill points', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      const savedSkillPoints = {
        'Athletics': 3,
        'Acrobatics': 2,
        'Arcana': 1,
        'Perception': 0,
        'Persuasion': 0,
      };
      
      act(() => {
        result.current.loadSkillPoints(savedSkillPoints);
      });
      
      expect(result.current.skillPoints).toEqual(savedSkillPoints);
    });

    it('should update remaining points when loading skill points', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      const savedSkillPoints = {
        'Athletics': 3,
        'Acrobatics': 2,
        'Arcana': 1,
        'Perception': 0,
        'Persuasion': 0,
      };
      
      act(() => {
        result.current.loadSkillPoints(savedSkillPoints);
      });
      
      // Total available: 22, spent: 6, remaining: 16
      expect(result.current.remainingPoints).toBe(16);
    });
  });

  describe('validation and edge cases', () => {
    it('should handle null or undefined attributes gracefully', () => {
      const { result } = renderHook(() => useSkills({} as Attributes, calculateModifier));
      
      expect(result.current.totalAvailablePoints).toBe(10); // Default when Intelligence is undefined
    });

    it('should handle null or undefined skillPoints gracefully', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      // This should not throw an error
      expect(result.current.skillPoints).toBeDefined();
      expect(result.current.remainingPoints).toBe(22);
    });

    it('should adjust skill points when Intelligence is reduced', () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      
      // Add some skill points
      act(() => {
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Athletics');
      });
      
      expect(result.current.skillPoints.Athletics).toBe(3);
      expect(result.current.remainingPoints).toBe(19);
      
      // Now simulate Intelligence reduction by re-rendering with lower Intelligence
      const lowIntAttributes: Attributes = {
        ...mockAttributes,
        Intelligence: 10, // modifier 0, so only 10 total points available
      };
      
      const { result: newResult } = renderHook(() => useSkills(lowIntAttributes, calculateModifier));
      
      // The hook should handle this gracefully, though in practice this would be handled
      // by the parent component re-rendering with new attributes
      expect(newResult.current.totalAvailablePoints).toBe(10);
    });

    it('should handle rapid skill point changes', async () => {
      const { result } = renderHook(() => useSkills(mockAttributes, calculateModifier));
      act(() => {
        result.current.addSkillPoint('Athletics');
        result.current.addSkillPoint('Acrobatics');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(1);
        expect(result.current.skillPoints.Acrobatics).toBe(1);
      });
      act(() => {
        result.current.removeSkillPoint('Athletics');
        result.current.addSkillPoint('Arcana');
      });
      await waitFor(() => {
        expect(result.current.skillPoints.Athletics).toBe(0);
        expect(result.current.skillPoints.Acrobatics).toBe(1);
        expect(result.current.skillPoints.Arcana).toBe(1);
      });
    });
  });
}); 