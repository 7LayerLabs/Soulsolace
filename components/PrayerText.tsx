import React, { useState } from 'react';
import { Language } from '../types';
import { Icon } from './Icon';

interface PrayerTextProps {
  prayerBody: string;
  originalLanguage?: Language;
  originalText?: string;
  transliteration?: string;
}

type DisplayMode = 'translation' | 'original' | 'transliteration';

const RTL_LANGUAGES: Language[] = [Language.Hebrew, Language.Arabic];

const isRTL = (language: Language | undefined): boolean => {
  return language !== undefined && RTL_LANGUAGES.includes(language);
};

export const PrayerText: React.FC<PrayerTextProps> = ({
  prayerBody,
  originalLanguage,
  originalText,
  transliteration,
}) => {
  const [displayMode, setDisplayMode] = useState<DisplayMode>('translation');
  const hasOriginal = originalLanguage && originalText;
  const hasTransliteration = hasOriginal && transliteration;

  const getDisplayText = (): string => {
    switch (displayMode) {
      case 'original':
        return originalText || prayerBody;
      case 'transliteration':
        return transliteration || prayerBody;
      default:
        return prayerBody;
    }
  };

  const shouldUseRTL = displayMode === 'original' && isRTL(originalLanguage);

  return (
    <div className="prose prose-lg prose-slate max-w-none relative">
      {/* Language toggle buttons */}
      {hasOriginal && (
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setDisplayMode('translation')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              displayMode === 'translation'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            English
          </button>
          <button
            onClick={() => setDisplayMode('original')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
              displayMode === 'original'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {originalLanguage}
          </button>
          {hasTransliteration && (
            <button
              onClick={() => setDisplayMode('transliteration')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all duration-200 ${
                displayMode === 'transliteration'
                  ? 'bg-slate-800 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span className="flex items-center gap-1">
                <Icon name="Volume2" className="w-3 h-3" />
                Transliteration
              </span>
            </button>
          )}
        </div>
      )}

      {/* Prayer body with quotation decoration */}
      <div className="quote-decoration relative pl-4">
        <p
          className={`text-slate-800 whitespace-pre-wrap font-serif text-2xl leading-relaxed italic transition-all duration-300 ${
            shouldUseRTL ? 'rtl-text' : ''
          }`}
          dir={shouldUseRTL ? 'rtl' : 'ltr'}
          lang={displayMode === 'original' ? originalLanguage?.toLowerCase() : 'en'}
        >
          {getDisplayText()}
        </p>
      </div>

      {/* Show current mode indicator when viewing non-English */}
      {displayMode !== 'translation' && (
        <div className="mt-4 text-xs text-slate-400 flex items-center gap-2">
          <Icon name="Languages" className="w-4 h-4" />
          {displayMode === 'original'
            ? `Viewing in ${originalLanguage}`
            : 'Viewing transliteration (pronunciation guide)'}
        </div>
      )}
    </div>
  );
};
