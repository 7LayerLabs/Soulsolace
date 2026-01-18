import React, { useState } from 'react';
import { Icon } from './Icon';
import { PrayerResponse } from '../types';
import { Religion } from '../types';

interface JournalEntryFormProps {
  prayer: PrayerResponse;
  religion: Religion;
  intention: string;
  onSave: (reflection: string, tags: string[]) => void;
  onCancel: () => void;
}

export const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  prayer,
  religion,
  intention,
  onSave,
  onCancel,
}) => {
  const [reflection, setReflection] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const tags = tagsInput
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);

    onSave(reflection, tags);
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Icon name="BookOpen" className="w-5 h-5 text-amber-600" />
            Add to Prayer Journal
          </h3>
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="X" className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Prayer Preview */}
          <div className="mb-6 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-500 mb-1">Prayer</p>
            <p className="font-medium text-slate-900">{prayer.title}</p>
            <p className="text-xs text-slate-400 mt-1">{religion}</p>
          </div>

          {/* Intention Preview */}
          <div className="mb-6 p-4 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700 mb-1 flex items-center gap-1">
              <Icon name="Heart" className="w-3 h-3" />
              Your Intention
            </p>
            <p className="text-sm text-slate-700 line-clamp-2">{intention}</p>
          </div>

          {/* Reflection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Personal Reflection
              <span className="text-slate-400 font-normal"> (optional)</span>
            </label>
            <textarea
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              placeholder="Write your thoughts, feelings, or any insights about this prayer..."
              className="w-full h-32 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Tags */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <Icon name="Tag" className="w-4 h-4 text-slate-400" />
              Tags
              <span className="text-slate-400 font-normal">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="gratitude, healing, strength..."
              className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-lg shadow-amber-200 disabled:opacity-50"
            >
              <Icon name="Save" className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save to Journal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
