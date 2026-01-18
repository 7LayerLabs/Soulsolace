import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { Season } from '../services/religiousCalendar';

interface SeasonalBannerProps {
  season: Season;
  religionId: string;
  onSuggestionClick?: (intention: string) => void;
}

const STORAGE_KEY_PREFIX = 'soulsolace_season_dismissed_';

export const SeasonalBanner: React.FC<SeasonalBannerProps> = ({
  season,
  religionId,
  onSuggestionClick
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const storageKey = `${STORAGE_KEY_PREFIX}${religionId}_${season.name}`;

  useEffect(() => {
    // Check if banner was dismissed this session
    const dismissed = sessionStorage.getItem(storageKey);
    if (dismissed) {
      setIsDismissed(true);
    } else {
      // Animate in after a short delay
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    setIsVisible(false);
    // Wait for animation to complete before actually hiding
    setTimeout(() => {
      setIsDismissed(true);
      sessionStorage.setItem(storageKey, 'true');
    }, 300);
  };

  const handleSuggestionClick = (intention: string) => {
    onSuggestionClick?.(intention);
  };

  if (isDismissed) {
    return null;
  }

  // Pick 2-3 suggested intentions to show
  const displayedIntentions = season.suggestedIntentions.slice(0, 3);

  return (
    <div
      className={`
        relative overflow-hidden rounded-xl mb-6 transition-all duration-300 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}
      `}
    >
      {/* Background with subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-50 via-amber-50/80 to-orange-50 border border-amber-200/50" />

      {/* Content */}
      <div className="relative p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Season icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Icon name="Calendar" className="w-5 h-5 text-amber-600" />
            </div>

            {/* Text content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-amber-800">
                  {season.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  Current Season
                </span>
              </div>

              <p className="text-sm text-amber-700/90 mb-3">
                {season.description}. Prayers for these themes may be meaningful:
              </p>

              {/* Suggestion chips */}
              <div className="flex flex-wrap gap-2">
                {displayedIntentions.map((intention) => (
                  <button
                    key={intention}
                    onClick={() => handleSuggestionClick(intention)}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium
                               bg-white/80 text-amber-700 border border-amber-200/50
                               hover:bg-amber-100 hover:border-amber-300
                               transition-all duration-200 active:scale-95"
                  >
                    <Icon name="Sparkles" className="w-3 h-3 mr-1.5 text-amber-500" />
                    {intention}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1.5 rounded-lg text-amber-400 hover:text-amber-600
                       hover:bg-amber-100 transition-colors"
            aria-label="Dismiss seasonal banner"
          >
            <Icon name="X" className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
