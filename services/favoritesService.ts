import { Religion } from '../types';

export interface FavoritePrayer {
  id: string;
  prayer: {
    title: string;
    prayerBody: string;
    explanation: string;
    isCanonical: boolean;
    origin?: string;
  };
  religion: Religion;
  situation: string;
  savedAt: number;
  tags: string[];
}

const STORAGE_KEY = 'soulsolace_favorites';
const MAX_FAVORITES = 100;

/**
 * Generate a unique ID for a favorite
 */
const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Get all favorites from localStorage
 */
export const getFavorites = (): FavoritePrayer[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const favorites = JSON.parse(stored) as FavoritePrayer[];
    // Sort by savedAt descending (most recent first)
    return favorites.sort((a, b) => b.savedAt - a.savedAt);
  } catch (error) {
    console.error('Error reading favorites from localStorage:', error);
    return [];
  }
};

/**
 * Save a prayer to favorites
 */
export const saveFavorite = (
  prayer: FavoritePrayer['prayer'],
  religion: Religion,
  situation: string,
  tags: string[] = []
): FavoritePrayer | null => {
  try {
    const favorites = getFavorites();

    // Check if we've reached the max limit
    if (favorites.length >= MAX_FAVORITES) {
      // Remove the oldest favorite to make room
      favorites.pop();
    }

    const newFavorite: FavoritePrayer = {
      id: generateId(),
      prayer,
      religion,
      situation,
      savedAt: Date.now(),
      tags
    };

    // Add to beginning of array (most recent first)
    favorites.unshift(newFavorite);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    return newFavorite;
  } catch (error) {
    console.error('Error saving favorite to localStorage:', error);
    return null;
  }
};

/**
 * Remove a favorite by ID
 */
export const removeFavorite = (id: string): boolean => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter(f => f.id !== id);

    if (filtered.length === favorites.length) {
      return false; // Favorite not found
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error removing favorite from localStorage:', error);
    return false;
  }
};

/**
 * Check if a prayer is already saved as a favorite
 * Compares by prayer title and body to determine uniqueness
 */
export const isFavorite = (prayerTitle: string, prayerBody: string): FavoritePrayer | null => {
  const favorites = getFavorites();
  return favorites.find(
    f => f.prayer.title === prayerTitle && f.prayer.prayerBody === prayerBody
  ) || null;
};

/**
 * Get favorites filtered by religion
 */
export const getFavoritesByReligion = (religion: Religion): FavoritePrayer[] => {
  return getFavorites().filter(f => f.religion === religion);
};

/**
 * Get favorites filtered by tag
 */
export const getFavoritesByTag = (tag: string): FavoritePrayer[] => {
  return getFavorites().filter(f =>
    f.tags.some(t => t.toLowerCase().includes(tag.toLowerCase()))
  );
};

/**
 * Search favorites by query (searches title, body, situation, and tags)
 */
export const searchFavorites = (query: string): FavoritePrayer[] => {
  const lowerQuery = query.toLowerCase();
  return getFavorites().filter(f =>
    f.prayer.title.toLowerCase().includes(lowerQuery) ||
    f.prayer.prayerBody.toLowerCase().includes(lowerQuery) ||
    f.situation.toLowerCase().includes(lowerQuery) ||
    f.tags.some(t => t.toLowerCase().includes(lowerQuery)) ||
    f.religion.toLowerCase().includes(lowerQuery)
  );
};

/**
 * Get total count of favorites
 */
export const getFavoritesCount = (): number => {
  return getFavorites().length;
};

/**
 * Clear all favorites
 */
export const clearAllFavorites = (): boolean => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing favorites from localStorage:', error);
    return false;
  }
};
