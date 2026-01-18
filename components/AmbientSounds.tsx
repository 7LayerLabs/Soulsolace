import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon';

type AmbientType = 'silence' | 'rain' | 'nature' | 'bells' | 'soft-music';

interface AmbientOption {
  id: AmbientType;
  label: string;
  icon: string;
}

const AMBIENT_OPTIONS: AmbientOption[] = [
  { id: 'silence', label: 'Silence', icon: 'VolumeX' },
  { id: 'rain', label: 'Rain', icon: 'CloudRain' },
  { id: 'nature', label: 'Nature', icon: 'Trees' },
  { id: 'bells', label: 'Bells', icon: 'Bell' },
  { id: 'soft-music', label: 'Soft Music', icon: 'Music' },
];

const STORAGE_KEY = 'soulsolace-ambient-preference';
const VOLUME_KEY = 'soulsolace-ambient-volume';

// Web Audio API based ambient sound generator
const createAmbientSound = (
  type: AmbientType,
  audioContext: AudioContext
): { node: AudioNode; stop: () => void } | null => {
  if (type === 'silence') return null;

  const gainNode = audioContext.createGain();
  gainNode.connect(audioContext.destination);

  let oscillators: OscillatorNode[] = [];
  let noiseNodes: AudioBufferSourceNode[] = [];
  let intervalId: ReturnType<typeof setInterval> | null = null;

  const createNoiseBuffer = (duration: number): AudioBuffer => {
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  };

  const createFilteredNoise = (
    lowFreq: number,
    highFreq: number,
    gain: number
  ): AudioBufferSourceNode => {
    const noise = audioContext.createBufferSource();
    noise.buffer = createNoiseBuffer(2);
    noise.loop = true;

    const lowpass = audioContext.createBiquadFilter();
    lowpass.type = 'lowpass';
    lowpass.frequency.value = highFreq;

    const highpass = audioContext.createBiquadFilter();
    highpass.type = 'highpass';
    highpass.frequency.value = lowFreq;

    const noiseGain = audioContext.createGain();
    noiseGain.gain.value = gain;

    noise.connect(lowpass);
    lowpass.connect(highpass);
    highpass.connect(noiseGain);
    noiseGain.connect(gainNode);

    noise.start();
    return noise;
  };

  switch (type) {
    case 'rain': {
      // Filtered white noise for rain
      noiseNodes.push(createFilteredNoise(200, 8000, 0.3));
      // Additional high-frequency component for rain droplets
      noiseNodes.push(createFilteredNoise(2000, 12000, 0.1));
      break;
    }

    case 'nature': {
      // Wind-like sound
      noiseNodes.push(createFilteredNoise(100, 400, 0.15));
      // Bird-like chirps using oscillators
      const createChirp = () => {
        const osc = audioContext.createOscillator();
        const chirpGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = 2000 + Math.random() * 2000;

        chirpGain.gain.setValueAtTime(0, audioContext.currentTime);
        chirpGain.gain.linearRampToValueAtTime(0.05, audioContext.currentTime + 0.05);
        chirpGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.15);

        osc.connect(chirpGain);
        chirpGain.connect(gainNode);

        osc.start();
        osc.stop(audioContext.currentTime + 0.2);
      };

      // Random chirps
      intervalId = setInterval(() => {
        if (Math.random() > 0.7) createChirp();
      }, 500);
      break;
    }

    case 'bells': {
      // Gentle bell tones at intervals
      const playBell = () => {
        const frequencies = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

        const osc = audioContext.createOscillator();
        const bellGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        bellGain.gain.setValueAtTime(0.1, audioContext.currentTime);
        bellGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 3);

        osc.connect(bellGain);
        bellGain.connect(gainNode);

        osc.start();
        osc.stop(audioContext.currentTime + 3);
      };

      // Play bell immediately and then at intervals
      playBell();
      intervalId = setInterval(playBell, 4000 + Math.random() * 2000);
      break;
    }

    case 'soft-music': {
      // Ambient drone with harmonics
      const baseFreq = 110; // A2
      const harmonics = [1, 2, 3, 4, 5];

      harmonics.forEach((harmonic, i) => {
        const osc = audioContext.createOscillator();
        const oscGain = audioContext.createGain();

        osc.type = 'sine';
        osc.frequency.value = baseFreq * harmonic;

        // Lower gain for higher harmonics
        oscGain.gain.value = 0.08 / (i + 1);

        osc.connect(oscGain);
        oscGain.connect(gainNode);

        osc.start();
        oscillators.push(osc);
      });

      // Add subtle modulation
      const lfo = audioContext.createOscillator();
      const lfoGain = audioContext.createGain();
      lfo.type = 'sine';
      lfo.frequency.value = 0.1;
      lfoGain.gain.value = 5;
      lfo.connect(lfoGain);
      oscillators.forEach((osc) => lfoGain.connect(osc.frequency));
      lfo.start();
      oscillators.push(lfo);
      break;
    }
  }

  return {
    node: gainNode,
    stop: () => {
      oscillators.forEach((osc) => {
        try {
          osc.stop();
        } catch (e) {
          // Ignore already stopped
        }
      });
      noiseNodes.forEach((node) => {
        try {
          node.stop();
        } catch (e) {
          // Ignore already stopped
        }
      });
      if (intervalId) clearInterval(intervalId);
    },
  };
};

interface AmbientSoundsProps {
  className?: string;
}

export const AmbientSounds: React.FC<AmbientSoundsProps> = ({ className = '' }) => {
  const [selectedAmbient, setSelectedAmbient] = useState<AmbientType>('silence');
  const [volume, setVolume] = useState(0.5);
  const [isExpanded, setIsExpanded] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSoundRef = useRef<{ node: AudioNode; stop: () => void } | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Load preferences from localStorage
  useEffect(() => {
    const savedAmbient = localStorage.getItem(STORAGE_KEY) as AmbientType | null;
    const savedVolume = localStorage.getItem(VOLUME_KEY);

    if (savedAmbient && AMBIENT_OPTIONS.some((opt) => opt.id === savedAmbient)) {
      setSelectedAmbient(savedAmbient);
    }
    if (savedVolume) {
      setVolume(parseFloat(savedVolume));
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, selectedAmbient);
    localStorage.setItem(VOLUME_KEY, volume.toString());
  }, [selectedAmbient, volume]);

  // Initialize or update ambient sound
  const updateAmbientSound = useCallback(() => {
    // Stop current sound
    if (currentSoundRef.current) {
      currentSoundRef.current.stop();
      currentSoundRef.current = null;
    }

    if (selectedAmbient === 'silence') {
      return;
    }

    // Create audio context if needed
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }

    // Create master gain node for volume control
    if (!gainNodeRef.current) {
      gainNodeRef.current = audioContextRef.current.createGain();
      gainNodeRef.current.connect(audioContextRef.current.destination);
    }

    gainNodeRef.current.gain.value = volume;

    // Create new ambient sound
    const sound = createAmbientSound(selectedAmbient, audioContextRef.current);
    if (sound) {
      currentSoundRef.current = sound;
    }
  }, [selectedAmbient, volume]);

  // Update sound when selection changes
  useEffect(() => {
    updateAmbientSound();

    return () => {
      if (currentSoundRef.current) {
        currentSoundRef.current.stop();
      }
    };
  }, [selectedAmbient, updateAmbientSound]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (currentSoundRef.current) {
        currentSoundRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handleAmbientChange = (type: AmbientType) => {
    setSelectedAmbient(type);
    // Resume audio context if suspended (browser policy)
    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const currentOption = AMBIENT_OPTIONS.find((opt) => opt.id === selectedAmbient);

  return (
    <div className={`${className}`}>
      {/* Collapsed view - toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
          selectedAmbient !== 'silence'
            ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
            : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
        }`}
      >
        <Icon name={currentOption?.icon || 'Volume2'} className="w-4 h-4" />
        <span>{currentOption?.label || 'Ambient'}</span>
        <Icon
          name="ChevronRight"
          className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`}
        />
      </button>

      {/* Expanded options */}
      {isExpanded && (
        <div className="mt-3 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200 shadow-lg animate-fade-in">
          <div className="flex flex-wrap gap-2 mb-4">
            {AMBIENT_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => handleAmbientChange(option.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                  selectedAmbient === option.id
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-50 text-slate-600 border border-slate-100 hover:bg-slate-100'
                }`}
              >
                <Icon name={option.icon} className="w-3.5 h-3.5" />
                <span>{option.label}</span>
              </button>
            ))}
          </div>

          {/* Volume slider */}
          {selectedAmbient !== 'silence' && (
            <div className="flex items-center gap-3">
              <Icon name="Volume1" className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-indigo-600"
              />
              <Icon name="Volume2" className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
