import React, { useState } from 'react';
import { PrayerResponse, GroundingSource } from '../types';
import { Icon } from './Icon';

interface PrayerDisplayProps {
  prayers: PrayerResponse[];
  sources: GroundingSource[];
  onReset: () => void;
  isLoading?: boolean;
}

export const PrayerDisplay: React.FC<PrayerDisplayProps> = ({ prayers, sources, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const activePrayer = prayers[activeIndex] || prayers[0];

  const handleCopy = () => {
    const text = `${activePrayer.title}\n\n${activePrayer.prayerBody}\n\nSource: ${activePrayer.origin}\n${activePrayer.explanation}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto w-full animate-fade-in-up">
      {/* Selection UI */}
      <div className="flex justify-center gap-2 mb-8">
        {prayers.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${activeIndex === idx
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105'
                : 'bg-white/80 backdrop-blur-md text-slate-500 hover:bg-white border border-white/40'
              }`}
          >
            Prayer {idx + 1}
          </button>
        ))}
      </div>

      <div className="glass-card rounded-3xl overflow-hidden relative group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-cover bg-center transition-opacity duration-700 group-hover:opacity-[0.05]" style={{ backgroundImage: 'url("/assets/hero.png")' }} />
        <div className={`h-3 bg-gradient-to-r relative z-10 ${activePrayer.isCanonical ? 'from-amber-400 via-yellow-500 to-amber-600' : 'from-indigo-400 via-purple-400 to-pink-400'}`} />

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${activePrayer.isCanonical
                  ? 'bg-amber-100/80 text-amber-700 border border-amber-200/50'
                  : 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/50'
                }`}>
                <Icon name={activePrayer.isCanonical ? "ShieldCheck" : "Sparkles"} className="w-3 h-3" />
                {activePrayer.isCanonical ? 'Scriptural / Canonical' : 'Tradition-Aligned'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-indigo-600 transition-colors flex items-center gap-2 text-xs font-bold uppercase tracking-wider"
            >
              {copied ? (
                <span className="text-green-600 font-medium">Copied</span>
              ) : (
                <>
                  <Icon name="Copy" className="w-4 h-4" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>

          <h2 className="text-3xl font-serif text-slate-900 mb-2 leading-tight">
            {activePrayer.title}
          </h2>
          <p className="text-sm text-slate-400 font-medium mb-8">
            {activePrayer.origin}
          </p>

          <div className="prose prose-lg prose-slate max-w-none">
            <p className="text-slate-800 whitespace-pre-wrap font-serif text-2xl leading-relaxed italic">
              {activePrayer.prayerBody}
            </p>
          </div>

          <div className="mt-10 pt-8 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Theological Context</h4>
            <p className="text-slate-600 leading-relaxed italic">
              {activePrayer.explanation}
            </p>
          </div>

          {sources.length > 0 && (
            <div className="mt-8 pt-6 border-t border-slate-50">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">References & Verifications</h4>
              <div className="flex flex-wrap gap-2">
                {sources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-all max-w-full"
                  >
                    <span className="truncate max-w-[200px]">{source.title}</span>
                    <Icon name="ExternalLink" className="w-3 h-3 flex-shrink-0" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onReset}
          className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-700 font-medium transition-colors px-6 py-3 rounded-full hover:bg-white/50"
        >
          <Icon name="ChevronLeft" className="w-5 h-5" />
          Seek Another Tradition
        </button>
      </div>
    </div>
  );
};
