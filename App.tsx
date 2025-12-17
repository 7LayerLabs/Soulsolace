import React, { useState, useRef, useEffect } from 'react';
import { AppState, Religion, ReligionOption, PrayerResponse, GroundingSource } from './types';
import { RELIGIONS } from './constants';
import { generatePrayer } from './services/geminiService';
import { ReligionCard } from './components/ReligionCard';
import { PrayerDisplay } from './components/PrayerDisplay';
import { Icon } from './components/Icon';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('SELECTION');
  const [selectedReligion, setSelectedReligion] = useState<ReligionOption | null>(null);
  const [situation, setSituation] = useState('');
  const [prayers, setPrayers] = useState<PrayerResponse[]>([]);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (state === 'INPUT' && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [state]);

  const handleReligionSelect = (religion: ReligionOption) => {
    setSelectedReligion(religion);
    setState('INPUT');
    setError(null);
  };

  const handleSubmit = async () => {
    if (!situation.trim() || !selectedReligion) return;

    setState('LOADING');
    setError(null);

    try {
      const { prayers, sources } = await generatePrayer(selectedReligion.id, situation);
      setPrayers(prayers);
      setSources(sources);
      setState('RESULT');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setState('INPUT');
    }
  };

  const handleReset = () => {
    setState('SELECTION');
    setSelectedReligion(null);
    setSituation('');
    setPrayers([]);
    setSources([]);
    setError(null);
  };

  const handleBack = () => {
    if (state === 'INPUT') {
      setState('SELECTION');
      setSelectedReligion(null);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Immersive Background */}
      <div
        className="fixed inset-0 z-0 opacity-60 pointer-events-none bg-cover bg-center"
        style={{ backgroundImage: 'url("/assets/bg.png")', filter: 'blur(40px)' }}
      />
      <div className="fixed inset-0 z-0 bg-white/20 backdrop-blur-[2px] pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 md:py-20">

        <header className={`text-center mb-12 transition-all duration-700 ${state === 'RESULT' ? 'md:mb-8 opacity-90' : 'md:mb-16'}`}>
          <div className="relative inline-flex items-center justify-center p-3 mb-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/40 overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-cover bg-center" style={{ backgroundImage: 'url("/assets/hero.png")' }} />
            <Icon name="ShieldCheck" className="w-6 h-6 text-amber-600 relative z-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4 drop-shadow-sm">
            SoulSolace
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto font-medium">
            Access authentic scriptural prayers and traditional liturgy verified for your path.
          </p>
        </header>

        <main>
          {state === 'SELECTION' && (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-semibold text-slate-800 mb-8 text-center">
                Select your tradition
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {RELIGIONS.map((rel) => (
                  <ReligionCard
                    key={rel.id}
                    option={rel}
                    onClick={handleReligionSelect}
                    isSelected={false}
                  />
                ))}
              </div>
            </div>
          )}

          {state === 'INPUT' && selectedReligion && (
            <div className="max-w-xl mx-auto animate-fade-in-up">
              <button
                onClick={handleBack}
                className="mb-6 text-sm text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <Icon name="ChevronLeft" className="w-4 h-4" />
                Back to traditions
              </button>

              <div className="bg-white p-8 rounded-3xl shadow-lg border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedReligion.color}`}>
                    <Icon name={selectedReligion.icon} className="w-4 h-4" />
                  </div>
                  <span className="font-semibold text-slate-900">{selectedReligion.name}</span>
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-2">What is your intention?</h2>
                <p className="text-slate-500 mb-6">Explain your need. We will search scriptural records for an authentic prayer that matches.</p>

                <textarea
                  ref={textareaRef}
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  placeholder="e.g., I need strength to overcome a period of loss..."
                  className="w-full h-40 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none text-lg"
                />

                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2">
                    <span className="font-bold">Error:</span> {error}
                  </div>
                )}

                <div className="mt-8 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!situation.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-medium transition-all transform active:scale-95 flex items-center gap-2 shadow-lg shadow-indigo-200"
                  >
                    <span>Search Authentic Prayers</span>
                    <Icon name="ArrowRight" className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {state === 'LOADING' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-amber-100 border-t-amber-500 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon name="ShieldCheck" className="w-8 h-8 text-amber-500 animate-pulse" />
                </div>
              </div>
              <h3 className="text-xl font-medium text-slate-800 mt-8">Searching scriptural records...</h3>
              <p className="text-slate-500 mt-2">Retrieving authentic liturgical texts</p>
            </div>
          )}

          {state === 'RESULT' && prayers.length > 0 && (
            <PrayerDisplay prayers={prayers} sources={sources} onReset={handleReset} />
          )}
        </main>

        <footer className="mt-20 text-center text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} SoulSolace. Verifying prayers via theological grounding.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;
