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
      {/* Enhanced Tab Selection */}
      <div className="flex justify-center gap-2 mb-8">
        {prayers.map((prayer, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`tab-btn ${activeIndex === idx ? 'active scale-105' : ''}`}
          >
            <span className="relative z-10">
              {prayer.isCanonical ? 'Scriptural' : 'Composed'} {idx + 1}
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

        <div className="p-8 md:p-12 relative z-10">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${activePrayer.isCanonical
                  ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200/50 shadow-sm'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/50 shadow-sm'
                }`}>
                <Icon name={activePrayer.isCanonical ? "ShieldCheck" : "Sparkles"} className="w-3.5 h-3.5" />
                {activePrayer.isCanonical ? 'Scriptural / Canonical' : 'Tradition-Aligned'}
              </span>
            </div>

            <button
              onClick={handleCopy}
              className="text-slate-400 hover:text-indigo-600 transition-all duration-300 flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-lg hover:bg-slate-50"
            >
              {copied ? (
                <span className="text-green-600 font-medium flex items-center gap-1">
                  <Icon name="Check" className="w-4 h-4" />
                  Copied
                </span>
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
          <p className="text-sm text-slate-400 font-medium mb-8 flex items-center gap-2">
            <Icon name="BookOpen" className="w-4 h-4" />
            {activePrayer.origin}
          </p>

          {/* Prayer body with quotation decoration */}
          <div className="prose prose-lg prose-slate max-w-none relative">
            <div className="quote-decoration relative pl-4">
              <p className="text-slate-800 whitespace-pre-wrap font-serif text-2xl leading-relaxed italic">
                {activePrayer.prayerBody}
              </p>
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
    </div>
  );
};
