import React from 'react';
import { Icon } from './Icon';

interface AudioPlayerProps {
  isPlaying: boolean;
  isPaused: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  rate: number;
  onRateChange: (rate: number) => void;
  isSupported: boolean;
}

const SPEED_OPTIONS = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
];

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  isPlaying,
  isPaused,
  onPlay,
  onPause,
  onResume,
  onStop,
  rate,
  onRateChange,
  isSupported,
}) => {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon name="VolumeX" className="w-4 h-4" />
        <span>Audio not supported in this browser</span>
      </div>
    );
  }

  const handlePlayPause = () => {
    if (isPlaying && !isPaused) {
      onPause();
    } else if (isPaused) {
      onResume();
    } else {
      onPlay();
    }
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
          isPlaying
            ? 'bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200'
            : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
        }`}
        title={isPlaying && !isPaused ? 'Pause' : isPaused ? 'Resume' : 'Listen to Prayer'}
      >
        {isPlaying && !isPaused ? (
          <>
            <Icon name="Pause" className="w-4 h-4" />
            <span>Pause</span>
          </>
        ) : isPaused ? (
          <>
            <Icon name="Play" className="w-4 h-4" />
            <span>Resume</span>
          </>
        ) : (
          <>
            <Icon name="Play" className="w-4 h-4" />
            <span>Listen</span>
          </>
        )}
      </button>

      {/* Stop Button - only show when playing or paused */}
      {(isPlaying || isPaused) && (
        <button
          onClick={onStop}
          className="flex items-center gap-2 px-3 py-2 rounded-xl font-medium text-sm bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200 transition-all duration-300"
          title="Stop"
        >
          <Icon name="Square" className="w-4 h-4" />
        </button>
      )}

      {/* Playing indicator */}
      {isPlaying && !isPaused && (
        <div className="flex items-center gap-1.5">
          <div className="flex items-end gap-0.5 h-4">
            <div className="w-1 bg-amber-500 rounded-full animate-sound-bar-1" />
            <div className="w-1 bg-amber-500 rounded-full animate-sound-bar-2" />
            <div className="w-1 bg-amber-500 rounded-full animate-sound-bar-3" />
          </div>
          <span className="text-xs text-amber-600 font-medium">Playing</span>
        </div>
      )}

      {/* Speed Control */}
      <div className="flex items-center gap-1 ml-auto">
        <span className="text-xs text-slate-400 mr-1">Speed:</span>
        {SPEED_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onRateChange(option.value)}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              rate === option.value
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};
