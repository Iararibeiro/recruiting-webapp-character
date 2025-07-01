export interface Attributes {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
}

export type Class = 'Barbarian' | 'Wizard' | 'Bard';

export interface Character {
  id: string;
  name: string;
  attributes: Attributes;
  skillPoints: Record<string, number>;
  selectedClass?: Class;
}

export interface CharacterData {
  attributes: Attributes;
  skillPoints: Record<string, number>;
  selectedClass?: string;
}