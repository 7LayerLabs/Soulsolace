import React, { useState } from 'react';
import { Religion } from '../types';
import { RELIGIONS } from '../constants';
import { Icon } from './Icon';

interface SubmitPrayerRequestProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_CHARS = 280;

export const SubmitPrayerRequest: React.FC<SubmitPrayerRequestProps> = ({ onSuccess, onCancel }) => {
  const [intention, setIntention] = useState('');
  const [selectedReligion, setSelectedReligion] = useState<Religion | ''>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const charCount = intention.length;
  const charCountClass = charCount > MAX_CHARS ? 'text-red-500' : charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intention.trim() || !selectedReligion || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/prayers/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intention: intention.trim(),
          religion: selectedReligion
        })
      });

      const data = await response.json();

      if (response.status === 429) {
        setError(data.error || 'Rate limit exceeded. Please try again later.');
        return;
      }

      if (!response.ok || !data.success) {
        setError(data.error || 'Failed to submit prayer request');
        return;
      }

      setIntention('');
      setSelectedReligion('');
      onSuccess();
    } catch (e) {
      setError('Failed to connect to server. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Your Prayer Intention
        </label>
        <textarea
          value={intention}
          onChange={(e) => setIntention(e.target.value.slice(0, MAX_CHARS + 20))}
          placeholder="Share what you'd like others to pray for..."
          className="w-full h-24 p-3 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none"
          disabled={submitting}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-slate-400">All requests are anonymous</span>
          <span className={`text-xs ${charCountClass}`}>
            {charCount}/{MAX_CHARS}
          </span>
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Faith Tradition
        </label>
        <div className="grid grid-cols-3 gap-2">
          {RELIGIONS.map((religion) => (
            <button
              key={religion.id}
              type="button"
              onClick={() => setSelectedReligion(religion.id)}
              disabled={submitting}
              className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${
                selectedReligion === religion.id
                  ? 'border-amber-500 bg-amber-50'
                  : 'border-slate-100 hover:border-slate-200 bg-white'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${religion.color.split(' ').slice(0, 2).join(' ')}`}>
                <Icon name={religion.icon} className="w-4 h-4" />
              </div>
              <span className="text-xs text-slate-600 text-center leading-tight">
                {religion.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-start gap-2">
          <Icon name="AlertCircle" className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-3 px-4 border border-slate-200 text-slate-600 rounded-xl font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!intention.trim() || !selectedReligion || charCount > MAX_CHARS || submitting}
          className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {submitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit Request'
          )}
        </button>
      </div>
    </form>
  );
};
