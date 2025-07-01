const API_BASE_URL = 'https://recruiting.verylongdomaintotestwith.ca/api';
const GITHUB_USERNAME = 'iararibeiro'; // Replace with your actual GitHub username

export interface CharacterData {
  attributes: {
    Strength: number;
    Dexterity: number;
    Constitution: number;
    Intelligence: number;
    Wisdom: number;
    Charisma: number;
  };
  skillPoints: Record<string, number>;
  selectedClass?: string;
}

export const characterApi = {
  async saveCharacter(characterData: CharacterData): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/${GITHUB_USERNAME}/character`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(characterData),
      });

      if (!response.ok) {
        throw new Error(`Failed to save character: ${response.status} ${response.statusText}`);
      }

      console.log('Character saved successfully');
    } catch (error) {
      console.error('Error saving character:', error);
      throw error;
    }
  },

  async loadCharacter(): Promise<CharacterData | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/${GITHUB_USERNAME}/character`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 404) {
        console.log('No saved character found');
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to load character: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Character loaded successfully');
      // The API returns {statusCode: 200, body: {...}}, so we need to extract the body
      return responseData.body || responseData;
    } catch (error) {
      console.error('Error loading character:', error);
      throw error;
    }
  },
}; 