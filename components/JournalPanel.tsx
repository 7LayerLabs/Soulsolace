import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import {
  JournalEntry,
  getEntries,
  updateEntry,
  deleteEntry,
} from '../services/journalService';

type FilterType = 'all' | 'answered' | 'unanswered';

interface JournalPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JournalPanel: React.FC<JournalPanelProps> = ({ isOpen, onClose }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingReflection, setEditingReflection] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [answeredNote, setAnsweredNote] = useState('');
  const [showAnsweredModal, setShowAnsweredModal] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadEntries();
    }
  }, [isOpen]);

  const loadEntries = () => {
    const allEntries = getEntries();
    setEntries(allEntries);
  };

  const filteredEntries = entries.filter((entry) => {
    if (filter === 'answered') return entry.answered;
    if (filter === 'unanswered') return !entry.answered;
    return true;
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    setEditingReflection(null);
  };

  const handleEditReflection = (entry: JournalEntry) => {
    setEditingReflection(entry.id);
    setReflectionText(entry.reflection);
  };

  const handleSaveReflection = (id: string) => {
    updateEntry(id, { reflection: reflectionText });
    loadEntries();
    setEditingReflection(null);
    setReflectionText('');
  };

  const handleMarkAnswered = (id: string) => {
    setShowAnsweredModal(id);
    setAnsweredNote('');
  };

  const handleConfirmAnswered = () => {
    if (showAnsweredModal) {
      updateEntry(showAnsweredModal, {
        answered: true,
        answeredNote: answeredNote || undefined,
      });
      loadEntries();
      setShowAnsweredModal(null);
      setAnsweredNote('');
    }
  };

  const handleUnmarkAnswered = (id: string) => {
    updateEntry(id, { answered: false, answeredNote: undefined });
    loadEntries();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      deleteEntry(id);
      loadEntries();
      if (expandedId === id) {
        setExpandedId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slideover Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl transform transition-transform animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
              <Icon name="BookOpen" className="w-6 h-6 text-amber-600" />
              Prayer Journal
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Icon name="X" className="w-5 h-5" />
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2">
            {(['all', 'answered', 'unanswered'] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filter === f
                    ? 'bg-amber-100 text-amber-700'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {f === 'all' && 'All'}
                {f === 'answered' && 'Answered'}
                {f === 'unanswered' && 'Unanswered'}
              </button>
            ))}
          </div>
        </div>

        {/* Entries List */}
        <div className="overflow-y-auto h-[calc(100vh-140px)] px-4 py-4">
          {filteredEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon name="BookOpen" className="w-8 h-8 text-slate-400" />
              </div>
              <p className="text-slate-500 font-medium">No journal entries yet</p>
              <p className="text-slate-400 text-sm mt-1">
                Add prayers to your journal from the prayer display
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-slate-50 rounded-xl overflow-hidden border border-slate-100 transition-all hover:border-slate-200"
                >
                  {/* Entry Header - Always visible */}
                  <button
                    onClick={() => handleToggleExpand(entry.id)}
                    className="w-full px-4 py-4 text-left"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Icon name="Calendar" className="w-3 h-3" />
                            {formatDate(entry.date)}
                          </span>
                          {entry.answered && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium flex items-center gap-1">
                              <Icon name="CheckCircle2" className="w-3 h-3" />
                              Answered
                            </span>
                          )}
                        </div>
                        <h3 className="font-medium text-slate-900 truncate">
                          {entry.prayerTitle}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-1 mt-1">
                          {entry.intention}
                        </p>
                      </div>
                      <Icon
                        name={expandedId === entry.id ? 'ChevronLeft' : 'ChevronRight'}
                        className={`w-5 h-5 text-slate-400 transition-transform ${
                          expandedId === entry.id ? 'rotate-[-90deg]' : 'rotate-90'
                        }`}
                      />
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedId === entry.id && (
                    <div className="px-4 pb-4 pt-0 border-t border-slate-100 animate-fade-in">
                      {/* Prayer Body */}
                      <div className="mt-4 p-3 bg-white rounded-lg">
                        <p className="text-xs text-slate-400 mb-1 uppercase tracking-wide font-medium">
                          Prayer
                        </p>
                        <p className="text-sm text-slate-700 italic whitespace-pre-wrap line-clamp-6">
                          {entry.prayerBody}
                        </p>
                      </div>

                      {/* Intention */}
                      <div className="mt-3 p-3 bg-amber-50 rounded-lg">
                        <p className="text-xs text-amber-600 mb-1 uppercase tracking-wide font-medium">
                          Intention
                        </p>
                        <p className="text-sm text-slate-700">{entry.intention}</p>
                      </div>

                      {/* Reflection */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-xs text-slate-400 uppercase tracking-wide font-medium">
                            Reflection
                          </p>
                          {editingReflection !== entry.id && (
                            <button
                              onClick={() => handleEditReflection(entry)}
                              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                            >
                              <Icon name="Edit3" className="w-3 h-3" />
                              {entry.reflection ? 'Edit' : 'Add'}
                            </button>
                          )}
                        </div>
                        {editingReflection === entry.id ? (
                          <div className="space-y-2">
                            <textarea
                              value={reflectionText}
                              onChange={(e) => setReflectionText(e.target.value)}
                              placeholder="Write your reflection..."
                              className="w-full h-24 p-3 rounded-lg bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                            />
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => setEditingReflection(null)}
                                className="px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-100 rounded-lg"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSaveReflection(entry.id)}
                                className="px-3 py-1.5 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-600 italic p-3 bg-white rounded-lg">
                            {entry.reflection || 'No reflection added yet'}
                          </p>
                        )}
                      </div>

                      {/* Answered Note */}
                      {entry.answered && entry.answeredNote && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-xs text-green-600 mb-1 uppercase tracking-wide font-medium">
                            How it was answered
                          </p>
                          <p className="text-sm text-slate-700">{entry.answeredNote}</p>
                        </div>
                      )}

                      {/* Tags */}
                      {entry.tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {entry.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-slate-200 text-slate-600 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1 px-2 py-1 hover:bg-red-50 rounded"
                        >
                          <Icon name="Trash2" className="w-3 h-3" />
                          Delete
                        </button>
                        {!entry.answered ? (
                          <button
                            onClick={() => handleMarkAnswered(entry.id)}
                            className="text-xs text-green-600 hover:text-green-700 flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 rounded-lg font-medium"
                          >
                            <Icon name="CheckCircle2" className="w-3.5 h-3.5" />
                            Mark as Answered
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnmarkAnswered(entry.id)}
                            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 px-3 py-1.5 hover:bg-slate-100 rounded-lg"
                          >
                            <Icon name="Circle" className="w-3.5 h-3.5" />
                            Mark as Unanswered
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mark as Answered Modal */}
      {showAnsweredModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowAnsweredModal(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
              <Icon name="CheckCircle2" className="w-5 h-5 text-green-600" />
              Prayer Answered
            </h3>
            <p className="text-sm text-slate-500 mb-4">
              Would you like to add a note about how this prayer was answered?
            </p>
            <textarea
              value={answeredNote}
              onChange={(e) => setAnsweredNote(e.target.value)}
              placeholder="Share how your prayer was answered... (optional)"
              className="w-full h-24 p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 resize-none mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAnsweredModal(null)}
                className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAnswered}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium flex items-center gap-2"
              >
                <Icon name="Check" className="w-4 h-4" />
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
