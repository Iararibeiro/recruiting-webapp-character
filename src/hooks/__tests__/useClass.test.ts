import { renderHook, act } from '@testing-library/react';
import { useClass } from '../useClass';
import { Class } from '../../types';

describe('useClass', () => {
  describe('initialization', () => {
    it('should initialize with null selected class', () => {
      const { result } = renderHook(() => useClass());
      
      expect(result.current.selectedClass).toBeNull();
    });
  });

  describe('setSelectedClass', () => {
    it('should set a selected class', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Barbarian');
      });
      
      expect(result.current.selectedClass).toBe('Barbarian');
    });

    it('should change selected class', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
      
      act(() => {
        result.current.setSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
    });

    it('should set selected class to null', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
      
      act(() => {
        result.current.setSelectedClass(null);
      });
      
      expect(result.current.selectedClass).toBeNull();
    });

    it('should handle all valid class types', () => {
      const { result } = renderHook(() => useClass());
      const validClasses: Class[] = ['Barbarian', 'Wizard', 'Bard'];
      
      validClasses.forEach(className => {
        act(() => {
          result.current.setSelectedClass(className);
        });
        
        expect(result.current.selectedClass).toBe(className);
      });
    });
  });

  describe('loadSelectedClass', () => {
    it('should load a saved class', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.loadSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
    });

    it('should load null class', () => {
      const { result } = renderHook(() => useClass());
      
      // First set a class
      act(() => {
        result.current.setSelectedClass('Barbarian');
      });
      
      expect(result.current.selectedClass).toBe('Barbarian');
      
      // Then load null
      act(() => {
        result.current.loadSelectedClass(null);
      });
      
      expect(result.current.selectedClass).toBeNull();
    });

    it('should override existing selection when loading', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
      
      act(() => {
        result.current.loadSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
    });
  });

  describe('state persistence', () => {
    it('should maintain state between multiple setSelectedClass calls', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Barbarian');
      });
      
      expect(result.current.selectedClass).toBe('Barbarian');
      
      act(() => {
        result.current.setSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
      
      act(() => {
        result.current.setSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
    });

    it('should maintain state between loadSelectedClass calls', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.loadSelectedClass('Barbarian');
      });
      
      expect(result.current.selectedClass).toBe('Barbarian');
      
      act(() => {
        result.current.loadSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
    });
  });

  describe('edge cases', () => {
    it('should handle rapid class changes', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Barbarian');
        result.current.setSelectedClass('Wizard');
        result.current.setSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
    });

    it('should handle setting the same class multiple times', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Wizard');
        result.current.setSelectedClass('Wizard');
        result.current.setSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
    });

    it('should handle loading the same class multiple times', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.loadSelectedClass('Bard');
        result.current.loadSelectedClass('Bard');
        result.current.loadSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
    });

    it('should handle alternating between setSelectedClass and loadSelectedClass', () => {
      const { result } = renderHook(() => useClass());
      
      act(() => {
        result.current.setSelectedClass('Barbarian');
      });
      
      expect(result.current.selectedClass).toBe('Barbarian');
      
      act(() => {
        result.current.loadSelectedClass('Wizard');
      });
      
      expect(result.current.selectedClass).toBe('Wizard');
      
      act(() => {
        result.current.setSelectedClass('Bard');
      });
      
      expect(result.current.selectedClass).toBe('Bard');
      
      act(() => {
        result.current.loadSelectedClass(null);
      });
      
      expect(result.current.selectedClass).toBeNull();
    });
  });

  describe('returned functions', () => {
    it('should return all expected functions', () => {
      const { result } = renderHook(() => useClass());
      
      expect(typeof result.current.setSelectedClass).toBe('function');
      expect(typeof result.current.loadSelectedClass).toBe('function');
    });

    it('should return selectedClass as a property', () => {
      const { result } = renderHook(() => useClass());
      
      expect('selectedClass' in result.current).toBe(true);
    });
  });
}); 