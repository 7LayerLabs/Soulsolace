import React, { useState, useEffect } from 'react';
import { PrayerResponse, GroundingSource, Language, Religion } from '../types';
import { Icon } from './Icon';
import { AudioPlayer } from './AudioPlayer';
import { AmbientSounds } from './AmbientSounds';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import { PrayerText } from './PrayerText';
import { saveFavorite, removeFavorite, isFavorite, FavoritePrayer } from '../services/favoritesService';
import { JournalEntryForm } from './JournalEntryForm';
import { addEntry } from '../services/journalService';

interface PrayerDisplayProps {
  prayers: PrayerResponse[];
  sources: GroundingSource[];
  onReset: () => void;
  isLoading?: boolean;
  religion?: Religion;
  situation?: string;
}

export const PrayerDisplay: React.FC<PrayerDisplayProps> = ({ prayers, sources, onReset, religion, situation }) => {
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [savedFavorite, setSavedFavorite] = useState<FavoritePrayer | null>(null);
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showJournalForm, setShowJournalForm] = useState(false);
  const [showJournalSavedToast, setShowJournalSavedToast] = useState(false);

  const activePrayer = prayers[activeIndex] || prayers[0];

  // Check if current prayer is already saved when it changes
  useEffect(() => {
    if (activePrayer) {
      const existing = isFavorite(activePrayer.title, activePrayer.prayerBody);
      setSavedFavorite(existing);
    }
  }, [activePrayer]);

  const handleToggleFavorite = () => {
    if (!activePrayer || !religion || !situation) return;

    if (savedFavorite) {
      // Remove from favorites
      removeFavorite(savedFavorite.id);
      setSavedFavorite(null);
    } else {
      // Save to favorites
      const newFavorite = saveFavorite(
        {
          title: activePrayer.title,
          prayerBody: activePrayer.prayerBody,
          explanation: activePrayer.explanation,
          isCanonical: activePrayer.isCanonical,
          origin: activePrayer.origin
        },
        religion,
        situation,
        []
      );
      if (newFavorite) {
        setSavedFavorite(newFavorite);
        setShowSavedToast(true);
        setTimeout(() => setShowSavedToast(false), 2000);
      }
    }
  };

  const handleAddToJournal = () => {
    setShowJournalForm(true);
  };

  const handleSaveToJournal = (reflection: string, tags: string[]) => {
    if (!activePrayer || !religion || !situation) return;

    const entry = addEntry({
      prayerTitle: activePrayer.title,
      prayerBody: activePrayer.prayerBody,
      religion: religion,
      intention: situation,
      reflection,
      answered: false,
      tags,
    });

    if (entry) {
      setShowJournalForm(false);
      setShowJournalSavedToast(true);
      setTimeout(() => setShowJournalSavedToast(false), 2000);
    }
  };

  // Text-to-speech hook
  const {
    speak,
    pause,
    resume,
    stop,
    isPlaying,
    isPaused,
    currentWordIndex,
    rate,
    setRate,
    isSupported,
  } = useTextToSpeech({ rate: 0.8 });

  // Stop speech when switching prayers
  useEffect(() => {
    stop();
  }, [activeIndex, stop]);

  // Handle play button click
  const handlePlay = () => {
    const textToSpeak = `${activePrayer.title}. ${activePrayer.prayerBody}`;
    speak(textToSpeak);
  };

  const handleCopy = () => {
    const text = `${activePrayer.title}\n\n${activePrayer.prayerBody}\n\nSource: ${activePrayer.origin}\n${activePrayer.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
      {/* Enhanced Tab Selection - responsive */}
      <div className="flex justify-center gap-1.5 sm:gap-2 mb-6 sm:mb-8 px-2">
        {prayers.map((prayer, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`tab-btn text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-2.5 ${activeIndex === idx ? 'active scale-105' : ''}`}
          >
            <span className="relative z-10">
              <span className="hidden sm:inline">{prayer.isCanonical ? 'Scriptural' : 'Composed'} {idx + 1}</span>
              <span className="sm:hidden">{prayer.isCanonical ? 'Script.' : 'Comp.'} {idx + 1}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="glass-card-premium rounded-3xl overflow-hidden relative group">
        {/* Background texture */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center transition-opacity duration-700 group-hover:opacity-[0.05]"
          style={{ backgroundImage: 'url("/assets/hero.png")' }}
        />

        {/* Gradient bar with shimmer effect */}
        <div
          className={`h-3 relative z-10 overflow-hidden ${activePrayer.isCanonical ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600' : 'bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400'}`}
        >
          {/* Shimmer overlay */}
          <div
            className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        </div>

        <div className="p-5 sm:p-8 md:p-12 relative z-10">
          {/* Header - stacks on mobile */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-col gap-2">
              <span className={`inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider sm:tracking-widest transition-all duration-300 ${activePrayer.isCanonical
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/50 shadow-sm'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/50 shadow-sm'
                }`}>
                <Icon name={activePrayer.isCanonical ? "ShieldCheck" : "Sparkles"} className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline">{activePrayer.isCanonical ? 'Scriptural / Canonical' : 'Tradition-Aligned'}</span>
                <span className="sm:hidden">{activePrayer.isCanonical ? 'Scriptural' : 'Composed'}</span>
              </span>
            </div>

            {/* Action buttons - icons only on mobile */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Favorite Button */}
              {religion && situation && (
                <button
                  onClick={handleToggleFavorite}
                  className={`transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${
                    savedFavorite
                      ? 'text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100'
                      : 'text-slate-400 hover:text-rose-500 hover:bg-slate-50'
                  }`}
                  title={savedFavorite ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Icon name="Heart" className={`w-4 h-4 ${savedFavorite ? 'fill-current' : ''}`} />
                  <span className="hidden sm:inline">{savedFavorite ? 'Saved' : 'Save'}</span>
                </button>
              )}
              <button
                onClick={handleAddToJournal}
                className="text-slate-400 hover:text-amber-600 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-amber-50"
                title="Add to journal"
              >
                <Icon name="BookOpen" className="w-4 h-4" />
                <span className="hidden sm:inline">Journal</span>
              </button>
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-indigo-600 transition-all duration-300 flex items-center gap-1.5 sm:gap-2 text-xs font-bold uppercase tracking-wider px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg hover:bg-slate-50"
                title="Copy prayer"
              >
                {copied ? (
                  <span className="text-green-600 font-medium flex items-center gap-1">
                    <Icon name="Check" className="w-4 h-4" />
                    <span className="hidden sm:inline">Copied</span>
                  </span>
                ) : (
                  <>
                    <Icon name="Copy" className="w-4 h-4" />
                    <span className="hidden sm:inline">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Saved Toast Notification */}
          {showSavedToast && (
            <div className="absolute top-20 right-8 animate-fade-in-up z-20">
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 text-sm font-medium">
                <Icon name="Check" className="w-4 h-4" />
                Saved to favorites
              </div>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-serif text-slate-900 mb-2 leading-tight">
            {activePrayer.title}
          </h2>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5 sm:gap-2">
              <Icon name="BookOpen" className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {activePrayer.origin}
            </p>
            {/* Language badge - show if prayer has original language that's not English */}
            {activePrayer.originalLanguage && (
              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                <Icon name="Languages" className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                {activePrayer.originalLanguage}
              </span>
            )}
          </div>

          {/* Prayer body with multi-language support */}
          <PrayerText
            prayerBody={activePrayer.prayerBody}
            originalLanguage={activePrayer.originalLanguage}
            originalText={activePrayer.originalText}
            transliteration={activePrayer.transliteration}
          />

          {/* Audio Controls Section */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Icon name="Volume2" className="w-4 h-4" />
              Listen to Prayer
            </h4>
            <div className="space-y-4">
              <AudioPlayer
                isPlaying={isPlaying}
                isPaused={isPaused}
                onPlay={handlePlay}
                onPause={pause}
                onResume={resume}
                onStop={stop}
                rate={rate}
                onRateChange={setRate}
                isSupported={isSupported}
              />
              <div className="flex items-center gap-4">
                <AmbientSounds />
              </div>
            </div>
          </div>

          {/* Theological Context */}
          <div className="mt-10 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Icon name="Info" className="w-4 h-4" />
              Theological Context
            </h4>
            <p className="text-slate-600 leading-relaxed italic">
              {activePrayer.explanation}
            </p>
          </div>

          {/* Enhanced Sources Section */}
          {sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Icon name="Link" className="w-4 h-4" />
                References & Verifications
              </h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group/source inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 hover:bg-white hover:border-indigo-200 hover:text-indigo-600 hover:shadow-md transition-all duration-300 max-w-full card-shine"
                  >
                    <span className="truncate max-w-[200px]">{source.title}</span>
                    <Icon
                      name="ExternalLink"
                      className="w-3 h-3 flex-shrink-0 transition-transform duration-300 group-hover/source:translate-x-0.5 group-hover/source:-translate-y-0.5"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-700 font-medium transition-all duration-300 px-6 py-3 rounded-full hover:bg-white/50 group"
        >
          <Icon name="ChevronLeft" className="w-5 h-5 transition-transform group-hover:-translate-x-1" />
          Seek Another Tradition
        </button>
      </div>

      {/* Journal Entry Form Modal */}
      {showJournalForm && religion && situation && (
        <JournalEntryForm
          prayer={activePrayer}
          religion={religion}
          intention={situation}
          onSave={handleSaveToJournal}
          onCancel={() => setShowJournalForm(false)}
        />
      )}

      {/* Journal Saved Toast */}
      {showJournalSavedToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-fade-in-up">
          <div className="flex items-center gap-3 px-5 py-3 bg-green-600 text-white rounded-xl shadow-lg">
            <Icon name="CheckCircle" className="w-5 h-5" />
            <span className="font-medium">Added to Prayer Journal</span>
          </div>
        </div>
      )}
    </div>
  );
};
