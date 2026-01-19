import React, { useState, useRef, useEffect, useCallback } from 'react';
import { AppState, Religion, ReligionOption, PrayerResponse, GroundingSource, LoadingPhase, LOADING_PHASES } from './types';
import { RELIGIONS } from './constants';
import { generatePrayer } from './services/geminiService';
import { ReligionCard } from './components/ReligionCard';
import { PrayerDisplay } from './components/PrayerDisplay';
import { SeasonalBanner } from './components/SeasonalBanner';
import { Icon } from './components/Icon';
import { InstallPrompt } from './components/InstallPrompt';
import { CommunityPanel } from './components/CommunityPanel';
import { SubscribeModal } from './components/SubscribeModal';
import { JournalPanel } from './components/JournalPanel';
import { FavoritesPanel } from './components/FavoritesPanel';
import { AuthModal } from './components/AuthModal';
import { SettingsPanel } from './components/SettingsPanel';
import { getPrimarySeason, Season } from './services/religiousCalendar';
import { useAuth, useUserPreferences } from './services/instantdb';

const MAX_CHARS = 500;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('SELECTION');
  const [selectedReligion, setSelectedReligion] = useState<ReligionOption | null>(null);
  const [situation, setSituation] = useState('');
  const [prayers, setPrayers] = useState<PrayerResponse[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState<LoadingPhase>('searching');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [showCommunityPanel, setShowCommunityPanel] = useState(false);
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showJournalPanel, setShowJournalPanel] = useState(false);
  const [showFavoritesPanel, setShowFavoritesPanel] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSettingsPanel, setShowSettingsPanel] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Auth and user preferences
  const { user } = useAuth();
  const { religion: savedReligion } = useUserPreferences();

  // Auto-select religion if user has one saved
  useEffect(() => {
    if (savedReligion && state === 'SELECTION' && !selectedReligion) {
      const savedOption = RELIGIONS.find(r => r.id === savedReligion);
      if (savedOption) {
        setSelectedReligion(savedOption);
        setState('INPUT');
        const season = getPrimarySeason(savedOption.id);
        setCurrentSeason(season);
      }
    }
  }, [savedReligion, state, selectedReligion]);

  useEffect(() => {
    if (state === 'INPUT' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state]);

  // Cleanup abort controller on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleReligionSelect = (religion: ReligionOption) => {
    setSelectedReligion(religion);
    setState('INPUT');
    setError(null);
    // Check for current religious season
    const season = getPrimarySeason(religion.id);
    setCurrentSeason(season);
  };

  const handleSubmit = useCallback(async () => {
    if (!situation.trim() || !selectedReligion || isSubmitting) return;

    // Abort any pending request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setIsSubmitting(true);
    setState('LOADING');
    setLoadingPhase('searching');
    setError(null);

    try {
      const { prayers, sources } = await generatePrayer(
        selectedReligion.id,
        situation,
        {
          signal: abortControllerRef.current.signal,
          onPhaseChange: setLoadingPhase,
          season: currentSeason || undefined
        }
      );
      setPrayers(prayers);
      setSources(sources);
      setState('RESULT');
    } catch (err) {
      // Ignore abort errors
      if (err instanceof DOMException && err.name === 'AbortError') {
        return;
      }
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('INPUT');
    } finally {
      setIsSubmitting(false);
    }
  }, [situation, selectedReligion, isSubmitting, currentSeason]);

  const handleReset = () => {
    // Abort any pending request
    abortControllerRef.current?.abort();

    setState('SELECTION');
    setSelectedReligion(null);
    setSituation('');
    setPrayers([]);
    setSources([]);
    setError(null);
    setIsSubmitting(false);
    setCurrentSeason(null);
  };

  const handleBack = () => {
    if (state === 'INPUT') {
      // Abort any pending request
      abortControllerRef.current?.abort();

      setState('SELECTION');
      setSelectedReligion(null);
      setIsSubmitting(false);
    }
  };

  const charCount = situation.length;
  const charCountClass = charCount > MAX_CHARS ? 'error' : charCount > MAX_CHARS * 0.9 ? 'warning' : '';

  const currentPhaseData = LOADING_PHASES[loadingPhase];
  const phases: LoadingPhase[] = ['searching', 'generating', 'finalizing'];
  const currentPhaseIndex = phases.indexOf(loadingPhase);

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Enhanced Background with Animated Orbs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Base background image */}
        <div
          className="absolute inset-0 opacity-50 bg-cover bg-center"
          style={{ backgroundImage: 'url("/assets/bg.png")', filter: 'blur(50px)' }}
        />

        {/* Animated gradient orbs */}
        <div className="orb orb-1 w-96 h-96 -top-48 -left-48" />
        <div className="orb orb-2 w-80 h-80 top-1/4 -right-40" />
        <div className="orb orb-3 w-72 h-72 bottom-20 left-1/4" />

        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }} />

        {/* Soft white overlay */}
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-20">

        {/* Navigation bar - horizontally scrollable on mobile */}
        <nav className="flex justify-end items-center gap-2 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide">
          <button
            onClick={() => setShowFavoritesPanel(true)}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 text-slate-600 hover:text-rose-500 hover:border-rose-200 transition-all group"
          >
            <Icon name="Heart" className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-medium">Favorites</span>
          </button>

          <button
            onClick={() => setShowJournalPanel(true)}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 text-slate-600 hover:text-amber-600 hover:border-amber-200 transition-all group"
          >
            <Icon name="BookOpen" className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-medium">Journal</span>
          </button>

          <button
            onClick={() => setShowCommunityPanel(true)}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all group"
          >
            <Icon name="Users" className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Community</span>
          </button>

          <button
            onClick={() => setShowSubscribeModal(true)}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 text-slate-600 hover:text-purple-600 hover:border-purple-200 transition-all group"
          >
            <Icon name="Mail" className="w-4 h-4 transition-transform group-hover:scale-110" />
            <span className="text-xs sm:text-sm font-medium hidden xs:inline">Subscribe</span>
          </button>

          <button
            onClick={() => setShowSettingsPanel(true)}
            className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-white/80 backdrop-blur-md rounded-xl shadow-sm border border-white/40 text-slate-600 hover:text-slate-800 hover:border-slate-300 transition-all group"
          >
            <Icon name="Settings" className="w-4 h-4 transition-transform group-hover:rotate-45" />
          </button>

          {user ? (
            <button
              onClick={() => setShowSettingsPanel(true)}
              className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-amber-500 rounded-xl shadow-sm text-white hover:bg-amber-600 transition-all group"
            >
              <Icon name="User" className="w-4 h-4" />
              <span className="text-xs sm:text-sm font-medium truncate max-w-[60px] sm:max-w-[100px]">
                {user.email?.split('@')[0]}
              </span>
            </button>
          ) : (
            <button
              onClick={() => setShowAuthModal(true)}
              className="flex-shrink-0 flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-sm text-white hover:from-amber-600 hover:to-orange-600 transition-all group"
            >
              <Icon name="LogIn" className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span className="text-xs sm:text-sm font-medium">Sign In</span>
            </button>
          )}
        </nav>

        <header className={`text-center mb-8 sm:mb-12 transition-all duration-700 ${state === 'RESULT' ? 'md:mb-8 opacity-90' : 'md:mb-16'}`}>
          <div className="relative inline-flex items-center justify-center p-2.5 sm:p-3 mb-4 sm:mb-6 bg-white/80 backdrop-blur-md rounded-xl sm:rounded-2xl shadow-sm border border-white/40 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("/assets/hero.png")' }} />
            <Icon name="ShieldCheck" className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 relative z-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-3 sm:mb-4 drop-shadow-sm">
            SoulSolace
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto font-medium px-2">
            Access authentic scriptural prayers and traditional liturgy verified for your path.
          </p>
        </header>

        <main>
          {state === 'SELECTION' && (
            <div className="animate-fade-in">
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-6 sm:mb-8 text-center">
                Select your tradition
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {RELIGIONS.map((rel, index) => (
                  <ReligionCard
                    key={rel.id}
                    option={rel}
                    onClick={handleReligionSelect}
                    isSelected={false}
                    index={index}
                  />
                ))}
              </div>
            </div>
          )}

          {state === 'INPUT' && selectedReligion && (
            <div className="max-w-xl mx-auto animate-fade-in-up">
              <button
                onClick={handleBack}
                className="mb-6 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors group"
              >
                <Icon name="ChevronLeft" className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to traditions
              </button>

              {/* Seasonal Banner */}
              {currentSeason && (
                <SeasonalBanner
                  season={currentSeason}
                  religionId={selectedReligion.id}
                  onSuggestionClick={(intention) => {
                    // Append or set the intention in the textarea
                    if (situation.trim()) {
                      setSituation((prev) => `${prev} (${intention})`);
                    } else {
                      setSituation(`I am seeking prayers for ${intention}`);
                    }
                    textareaRef.current?.focus();
                  }}
                />
              )}

              <div className="glass-card-premium rounded-3xl">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedReligion.color} transition-transform hover:scale-110`}>
                      <Icon name={selectedReligion.icon} className="w-5 h-5" />
                    </div>
                    <span className="font-semibold text-slate-900">{selectedReligion.name}</span>
                  </div>

                  <h2 className="text-2xl font-bold text-slate-900 mb-2">What is your intention?</h2>
                  <p className="text-slate-500 mb-6">Explain your need. We will search scriptural records for an authentic prayer that matches.</p>

                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={situation}
                      onChange={(e) => setSituation(e.target.value.slice(0, MAX_CHARS + 50))}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="e.g., I need strength to overcome a period of loss..."
                      className="w-full h-40 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-lg"
                    />
                    <div className={`focus-line ${isFocused ? 'active' : ''}`} />

                    {/* Character counter */}
                    <div className="flex justify-between items-center mt-2">
                      <div />
                      <span className={`char-counter ${charCountClass}`}>
                        {charCount}/{MAX_CHARS}
                      </span>
                    </div>
                  </div>

                  {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3 animate-scale-in">
                      <Icon name="AlertCircle" className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold">Error:</span> {error}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!situation.trim() || charCount > MAX_CHARS || isSubmitting}
                      className="relative bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-200 btn-glow card-shine overflow-hidden"
                    >
                      <span>Search Authentic Prayers</span>
                      <Icon name="ArrowRight" className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {state === 'LOADING' && (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              {/* Concentric rings loader */}
              <div className="relative w-20 h-20 ring-loader">
                <div className="ring ring-1" />
                <div className="ring ring-2" />
                <div className="ring ring-3" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="ShieldCheck" className="w-6 h-6 text-amber-500 animate-breathe" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-64 mt-10">
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${currentPhaseData.progress}%` }}
                  />
                </div>
              </div>

              {/* Phase message */}
              <h3 className="text-xl font-medium text-slate-800 mt-6 transition-all duration-300">
                {currentPhaseData.message}
              </h3>

              {/* Phase dots */}
              <div className="phase-dots mt-4">
                {phases.map((phase, idx) => (
                  <div
                    key={phase}
                    className={`phase-dot ${idx === currentPhaseIndex ? 'active' : ''} ${idx < currentPhaseIndex ? 'completed' : ''}`}
                  />
                ))}
              </div>

              <p className="text-slate-500 mt-4 text-sm">Retrieving authentic liturgical texts</p>
            </div>
          )}

          {state === 'RESULT' && prayers.length > 0 && (
            <PrayerDisplay
              prayers={prayers}
              sources={sources}
              onReset={handleReset}
              religion={selectedReligion?.id}
              situation={situation}
            />
          )}
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} SoulSolace. Verifying prayers via theological grounding.</p>
        </footer>
      </div>

      {/* PWA Install Prompt */}
      <InstallPrompt />

      {/* Community Panel */}
      <CommunityPanel
        isOpen={showCommunityPanel}
        onClose={() => setShowCommunityPanel(false)}
      />

      {/* Subscribe Modal */}
      <SubscribeModal
        isOpen={showSubscribeModal}
        onClose={() => setShowSubscribeModal(false)}
      />

      {/* Journal Panel */}
      <JournalPanel
        isOpen={showJournalPanel}
        onClose={() => setShowJournalPanel(false)}
      />

      {/* Favorites Panel */}
      <FavoritesPanel
        isOpen={showFavoritesPanel}
        onClose={() => setShowFavoritesPanel(false)}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />

      <SettingsPanel
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
        onSignInClick={() => {
          setShowSettingsPanel(false);
          setShowAuthModal(true);
        }}
      />
    </div>
  );
};

export default App;
