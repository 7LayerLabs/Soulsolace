import { useState, useEffect, useCallback } from 'react';

export interface LanguagePreference {
  showOriginal: boolean;
  showTransliteration: boolean;
}

const STORAGE_KEY = 'soulsolace-language-preference';

const defaultPreferences: LanguagePreference = {
  showOriginal: true,
  showTransliteration: false,
};

export const useLanguagePreference = () => {
  const [preferences, setPreferences] = useState<LanguagePreference>(() => {
    if (typeof window === 'undefined') return defaultPreferences;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultPreferences, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to load language preferences:', e);
    }
    return defaultPreferences;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    } catch (e) {
      console.warn('Failed to save language preferences:', e);
    }
  }, [preferences]);

  const setShowOriginal = useCallback((value: boolean) => {
    setPreferences(prev => ({ ...prev, showOriginal: value }));
  }, []);

  const setShowTransliteration = useCallback((value: boolean) => {
    setPreferences(prev => ({ ...prev, showTransliteration: value }));
  }, []);

  const toggleShowOriginal = useCallback(() => {
    setPreferences(prev => ({ ...prev, showOriginal: !prev.showOriginal }));
  }, []);

  const toggleShowTransliteration = useCallback(() => {
    setPreferences(prev => ({ ...prev, showTransliteration: !prev.showTransliteration }));
  }, []);

  return {
    ...preferences,
    setShowOriginal,
    setShowTransliteration,
    toggleShowOriginal,
    toggleShowTransliteration,
  };
};
