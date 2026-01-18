import { useState, useEffect, useCallback, useRef } from 'react';

interface UseTextToSpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

interface UseTextToSpeechReturn {
  speak: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  isPlaying: boolean;
  isPaused: boolean;
  currentWordIndex: number;
  setRate: (rate: number) => void;
  rate: number;
  isSupported: boolean;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  setSelectedVoice: (voice: SpeechSynthesisVoice) => void;
}

// Prefer calm, clear voices for meditative reading
const preferredVoiceNames = [
  'Samantha', // macOS
  'Karen', // macOS Australian
  'Daniel', // macOS UK
  'Google UK English Female',
  'Google US English',
  'Microsoft Zira',
  'Microsoft David',
];

export const useTextToSpeech = (
  options: UseTextToSpeechOptions = {}
): UseTextToSpeechReturn => {
  const { rate: initialRate = 0.8, pitch = 1, volume = 1 } = options;

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [rate, setRate] = useState(initialRate);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isSupported, setIsSupported] = useState(false);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const wordsRef = useRef<string[]>([]);

  // Check for browser support and load voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      setIsSupported(true);

      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Auto-select a preferred voice
        if (availableVoices.length > 0 && !selectedVoice) {
          // Find a preferred voice
          const preferred = availableVoices.find((v) =>
            preferredVoiceNames.some((name) =>
              v.name.toLowerCase().includes(name.toLowerCase())
            )
          );
          // Fallback to first English voice or first voice
          const englishVoice = availableVoices.find((v) =>
            v.lang.startsWith('en')
          );
          setSelectedVoice(preferred || englishVoice || availableVoices[0]);
        }
      };

      // Load voices immediately if available
      loadVoices();

      // Chrome loads voices asynchronously
      window.speechSynthesis.onvoiceschanged = loadVoices;

      return () => {
        window.speechSynthesis.onvoiceschanged = null;
      };
    }
  }, [selectedVoice]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSupported || !text) return;

      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      // Split text into words for highlighting
      wordsRef.current = text.split(/\s+/);

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      // Track word boundaries for highlighting
      let charIndex = 0;
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          // Find word index based on character position
          const textBeforeBoundary = text.slice(0, event.charIndex);
          const wordsBefore = textBeforeBoundary.split(/\s+/).filter(Boolean);
          setCurrentWordIndex(wordsBefore.length);
        }
      };

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentWordIndex(0);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      };

      utterance.onerror = (event) => {
        // Ignore interrupted errors (from stop/cancel)
        if (event.error !== 'interrupted') {
          console.error('Speech synthesis error:', event.error);
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentWordIndex(-1);
      };

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, rate, pitch, volume, selectedVoice]
  );

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPaused(false);
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentWordIndex(-1);
  }, [isSupported]);

  return {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    currentWordIndex,
    setRate,
    rate,
    isSupported,
    voices,
    selectedVoice,
    setSelectedVoice,
  };
};
