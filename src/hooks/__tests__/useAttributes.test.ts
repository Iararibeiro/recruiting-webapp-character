import { renderHook, act } from '@testing-library/react';
import { useAttributes } from '../useAttributes';
import { Attributes } from '../../types';

describe('useAttributes', () => {
  const mockAttributes: Attributes = {
    Strength: 12,
    Dexterity: 14,
    Constitution: 10,
    Intelligence: 16,
    Wisdom: 8,
    Charisma: 10,
  };

  describe('initialization', () => {
    it('should initialize with default attributes when no initial value is provided', () => {
      const { result } = renderHook(() => useAttributes());
      
      expect(result.current.attributes).toEqual({
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10,
      });
      expect(result.current.isLoading).toBe(true);
    });

    it('should initialize with provided attributes', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      expect(result.current.attributes).toEqual(mockAttributes);
      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('handleAttributeChange', () => {
    it('should increase an attribute value when total would not exceed 70', () => {
      // Set up with 68 points, so +2 is allowed
      const almostMax: Attributes = {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 18, // 68 total
      };
      const { result } = renderHook(() => useAttributes(almostMax));
      act(() => {
        result.current.handleAttributeChange('Strength', 2); // 68+2=70
      });
      expect(result.current.attributes.Strength).toBe(12);
      expect(result.current.getTotalAttributes()).toBe(70);
    });

    it('should block increase if total would exceed 70', () => {
      // Set up with 69 points, so +2 is blocked
      const almostMax: Attributes = {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 19, // 69 total
      };
      const { result } = renderHook(() => useAttributes(almostMax));
      act(() => {
        result.current.handleAttributeChange('Strength', 2); // 69+2=71 (blocked)
      });
      expect(result.current.attributes.Strength).toBe(10);
      expect(result.current.getTotalAttributes()).toBe(69);
    });

    it('should allow changes when total would be exactly 70', () => {
      // Set up with 69 points, so +1 is allowed
      const almostMax: Attributes = {
        Strength: 10,
        Dexterity: 10,
        Constitution: 10,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 19, // 69 total
      };
      const { result } = renderHook(() => useAttributes(almostMax));
      act(() => {
        result.current.handleAttributeChange('Strength', 1); // 69+1=70
      });
      expect(result.current.attributes.Strength).toBe(11);
      expect(result.current.getTotalAttributes()).toBe(70);
    });

    it('should decrease an attribute value', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -1);
      });
      
      expect(result.current.attributes.Strength).toBe(11);
    });

    it('should not allow negative values', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -15);
      });
      
      expect(result.current.attributes.Strength).toBe(12); // Should remain unchanged
    });

    it('should not allow total attributes to exceed 70', () => {
      const highAttributes: Attributes = {
        Strength: 20,
        Dexterity: 20,
        Constitution: 20,
        Intelligence: 10,
        Wisdom: 10,
        Charisma: 10,
      };
      const { result } = renderHook(() => useAttributes(highAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Intelligence', 5);
      });
      
      expect(result.current.attributes.Intelligence).toBe(10); // Should remain unchanged
    });
  });

  describe('calculateModifier', () => {
    it('should calculate correct modifiers for various values', () => {
      const { result } = renderHook(() => useAttributes());
      
      expect(result.current.calculateModifier(1)).toBe(-5);
      expect(result.current.calculateModifier(8)).toBe(-1);
      expect(result.current.calculateModifier(10)).toBe(0);
      expect(result.current.calculateModifier(12)).toBe(1);
      expect(result.current.calculateModifier(14)).toBe(2);
      expect(result.current.calculateModifier(18)).toBe(4);
      expect(result.current.calculateModifier(20)).toBe(5);
    });
  });

  describe('getTotalAttributes', () => {
    it('should calculate total attributes correctly', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      expect(result.current.getTotalAttributes()).toBe(70);
    });

    it('should update total when attributes change', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -2);
      });
      
      expect(result.current.getTotalAttributes()).toBe(68);
    });
  });

  describe('getRemainingPoints', () => {
    it('should calculate remaining points correctly', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      expect(result.current.getRemainingPoints()).toBe(0); // 70 total - 70 = 0
    });

    it('should update remaining points when attributes change', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -2);
      });
      
      expect(result.current.getRemainingPoints()).toBe(2); // 70 total - 68 = 2
    });
  });

  describe('loadAttributes', () => {
    it('should load new attributes', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      const newAttributes: Attributes = {
        Strength: 15,
        Dexterity: 15,
        Constitution: 15,
        Intelligence: 15,
        Wisdom: 15,
        Charisma: 15,
      };
      
      act(() => {
        result.current.loadAttributes(newAttributes);
      });
      
      expect(result.current.attributes).toEqual(newAttributes);
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useAttributes());
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle multiple rapid attribute changes within limits', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -1);
        result.current.handleAttributeChange('Dexterity', -1);
        result.current.handleAttributeChange('Constitution', -1);
      });
      
      expect(result.current.attributes.Strength).toBe(11);
      expect(result.current.attributes.Dexterity).toBe(13);
      expect(result.current.attributes.Constitution).toBe(9);
    });

    it('should maintain other attributes when one is changed', () => {
      const { result } = renderHook(() => useAttributes(mockAttributes));
      
      act(() => {
        result.current.handleAttributeChange('Strength', -2);
      });
      
      expect(result.current.attributes.Dexterity).toBe(14);
      expect(result.current.attributes.Constitution).toBe(10);
      expect(result.current.attributes.Intelligence).toBe(16);
      expect(result.current.attributes.Wisdom).toBe(8);
      expect(result.current.attributes.Charisma).toBe(10);
    });
  });
}); 