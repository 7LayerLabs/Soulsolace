import { Religion } from '../types';

export interface JournalEntry {
  id: string;
  date: string;
  prayerTitle: string;
  prayerBody: string;
  religion: Religion;
  intention: string;
  reflection: string;
  answered: boolean;
  answeredNote?: string;
  tags: string[];
}

const STORAGE_KEY = 'soulsolace_journal';
const MAX_ENTRIES = 500;

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const getEntries = (): JournalEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const entries = JSON.parse(stored) as JournalEntry[];
    // Sort by date, newest first
    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error) {
    console.error('Failed to load journal entries:', error);
    return [];
  }
};

export const getEntryById = (id: string): JournalEntry | null => {
  const entries = getEntries();
  return entries.find(entry => entry.id === id) || null;
};

export const addEntry = (entry: Omit<JournalEntry, 'id' | 'date'>): JournalEntry | null => {
  try {
    const entries = getEntries();

    // Check max entries limit
    if (entries.length >= MAX_ENTRIES) {
      console.warn('Journal has reached maximum entries limit');
      // Remove oldest entry to make room
      entries.pop();
    }

    const newEntry: JournalEntry = {
      ...entry,
      id: generateId(),
      date: new Date().toISOString(),
    };

    entries.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return newEntry;
  } catch (error) {
    console.error('Failed to add journal entry:', error);
    return null;
  }
};

export const updateEntry = (id: string, updates: Partial<Omit<JournalEntry, 'id' | 'date'>>): JournalEntry | null => {
  try {
    const entries = getEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      console.error('Journal entry not found:', id);
      return null;
    }

    entries[index] = {
      ...entries[index],
      ...updates,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    return entries[index];
  } catch (error) {
    console.error('Failed to update journal entry:', error);
    return null;
  }
};

export const deleteEntry = (id: string): boolean => {
  try {
    const entries = getEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);

    if (filteredEntries.length === entries.length) {
      console.error('Journal entry not found:', id);
      return false;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredEntries));
    return true;
  } catch (error) {
    console.error('Failed to delete journal entry:', error);
    return false;
  }
};

export const markAsAnswered = (id: string, note?: string): JournalEntry | null => {
  return updateEntry(id, {
    answered: true,
    answeredNote: note
  });
};

export const getEntriesCount = (): number => {
  return getEntries().length;
};
