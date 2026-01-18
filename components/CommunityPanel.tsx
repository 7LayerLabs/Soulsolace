import React, { useState, useEffect, useCallback } from 'react';
import { Icon } from './Icon';
import { SubmitPrayerRequest } from './SubmitPrayerRequest';
import { Religion } from '../types';

interface CommunityPrayer {
  id: string;
  intention: string;
  religion: string;
  isAnonymous: boolean;
  timestamp: number;
  prayerCount: number;
}

interface CommunityPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const RELIGION_ICONS: Record<string, string> = {
  [Religion.Christianity]: 'Cross',
  [Religion.Islam]: 'MoonStar',
  [Religion.Judaism]: 'Star',
  [Religion.Hinduism]: 'Om',
  [Religion.Buddhism]: 'Flower2',
  [Religion.Sikhism]: 'Sparkles',
  [Religion.Bahai]: 'Heart',
  [Religion.Spiritual]: 'Sparkles',
  [Religion.Secular]: 'Heart',
};

const RELIGION_COLORS: Record<string, string> = {
  [Religion.Christianity]: 'bg-blue-100 text-blue-600',
  [Religion.Islam]: 'bg-emerald-100 text-emerald-600',
  [Religion.Judaism]: 'bg-indigo-100 text-indigo-600',
  [Religion.Hinduism]: 'bg-orange-100 text-orange-600',
  [Religion.Buddhism]: 'bg-amber-100 text-amber-600',
  [Religion.Sikhism]: 'bg-yellow-100 text-yellow-600',
  [Religion.Bahai]: 'bg-rose-100 text-rose-600',
  [Religion.Spiritual]: 'bg-purple-100 text-purple-600',
  [Religion.Secular]: 'bg-slate-100 text-slate-600',
};

function getTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

export const CommunityPanel: React.FC<CommunityPanelProps> = ({ isOpen, onClose }) => {
  const [prayers, setPrayers] = useState<CommunityPrayer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prayingFor, setPrayingFor] = useState<Set<string>>(new Set());
  const [prayedFor, setPrayedFor] = useState<Set<string>>(new Set());
  const [showSubmitForm, setShowSubmitForm] = useState(false);

  const fetchPrayers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/prayers/list');
      const data = await response.json();
      if (data.success) {
        setPrayers(data.prayers);
      } else {
        setError('Failed to load prayers');
      }
    } catch (e) {
      setError('Failed to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchPrayers();
    }
  }, [isOpen, fetchPrayers]);

  const handlePray = async (prayerId: string) => {
    if (prayingFor.has(prayerId) || prayedFor.has(prayerId)) return;

    setPrayingFor(prev => new Set(prev).add(prayerId));

    try {
      const response = await fetch('/api/prayers/pray', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId })
      });

      const data = await response.json();

      if (data.success) {
        setPrayers(prev => prev.map(p =>
          p.id === prayerId ? { ...p, prayerCount: data.prayerCount } : p
        ));
        setPrayedFor(prev => new Set(prev).add(prayerId));
      } else if (data.alreadyPrayed) {
        setPrayedFor(prev => new Set(prev).add(prayerId));
      }
    } catch (e) {
      console.error('Failed to pray:', e);
    } finally {
      setPrayingFor(prev => {
        const next = new Set(prev);
        next.delete(prayerId);
        return next;
      });
    }
  };

  const handleSubmitSuccess = () => {
    setShowSubmitForm(false);
    fetchPrayers();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Icon name="Heart" className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Community Prayers</h2>
              <p className="text-xs text-slate-500">Support others in their journey</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Submit button */}
        <div className="p-4 border-b border-slate-100">
          <button
            onClick={() => setShowSubmitForm(!showSubmitForm)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-medium hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Share Your Prayer Request
          </button>
        </div>

        {/* Submit form */}
        {showSubmitForm && (
          <div className="border-b border-slate-100">
            <SubmitPrayerRequest
              onSuccess={handleSubmitSuccess}
              onCancel={() => setShowSubmitForm(false)}
            />
          </div>
        )}

        {/* Prayer list */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && prayers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-slate-500 text-sm">Loading prayers...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <Icon name="AlertCircle" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{error}</p>
              <button
                onClick={fetchPrayers}
                className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-medium"
              >
                Try again
              </button>
            </div>
          ) : prayers.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Heart" className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No prayer requests yet</p>
              <p className="text-slate-400 text-sm mt-1">Be the first to share</p>
            </div>
          ) : (
            <div className="space-y-3">
              {prayers.map(prayer => (
                <div
                  key={prayer.id}
                  className="bg-white border border-slate-100 rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  {/* Religion icon and time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${RELIGION_COLORS[prayer.religion] || 'bg-slate-100 text-slate-600'}`}>
                      <Icon name={RELIGION_ICONS[prayer.religion] || 'Sparkles'} className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs text-slate-400">{getTimeAgo(prayer.timestamp)}</span>
                  </div>

                  {/* Intention */}
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">
                    {prayer.intention}
                  </p>

                  {/* Footer with pray button */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {prayer.prayerCount} {prayer.prayerCount === 1 ? 'person' : 'people'} praying
                    </span>
                    <button
                      onClick={() => handlePray(prayer.id)}
                      disabled={prayingFor.has(prayer.id) || prayedFor.has(prayer.id)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        prayedFor.has(prayer.id)
                          ? 'bg-amber-100 text-amber-700 cursor-default'
                          : prayingFor.has(prayer.id)
                          ? 'bg-slate-100 text-slate-400 cursor-wait'
                          : 'bg-slate-100 text-slate-600 hover:bg-amber-100 hover:text-amber-700'
                      }`}
                    >
                      {prayedFor.has(prayer.id) ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                          </svg>
                          Praying
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                          I'm praying
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
