import React, { useState, useEffect } from 'react';
import { Icon } from './Icon';
import { getFavorites, removeFavorite, searchFavorites, FavoritePrayer } from '../services/favoritesService';
import { Religion } from '../types';

interface FavoritesPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrayer?: (favorite: FavoritePrayer) => void;
}

export const FavoritesPanel: React.FC<FavoritesPanelProps> = ({ isOpen, onClose, onSelectPrayer }) => {
  const [favorites, setFavorites] = useState<FavoritePrayer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterReligion, setFilterReligion] = useState<Religion | ''>('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Load favorites when panel opens
  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  const loadFavorites = () => {
    const allFavorites = getFavorites();
    setFavorites(allFavorites);
  };

  // Filter favorites based on search and religion filter
  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = searchQuery
      ? fav.prayer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.prayer.prayerBody.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        fav.religion.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesReligion = filterReligion
      ? fav.religion === filterReligion
      : true;

    return matchesSearch && matchesReligion;
  });

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (removeFavorite(id)) {
      setFavorites(prev => prev.filter(f => f.id !== id));
      if (expandedId === id) {
        setExpandedId(null);
      }
    }
  };

  const handleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get unique religions from favorites for filter dropdown
  const availableReligions = Array.from(new Set(favorites.map(f => f.religion)));

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md z-50 animate-slide-in-right">
        <div className="h-full flex flex-col bg-white shadow-2xl">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-rose-50 to-pink-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                  <Icon name="Heart" className="w-5 h-5 text-rose-500" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Saved Prayers</h2>
                  <p className="text-sm text-slate-500">{favorites.length} prayer{favorites.length !== 1 ? 's' : ''} saved</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="px-6 py-4 border-b border-slate-100 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search prayers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all"
              />
            </div>

            {/* Religion Filter */}
            {availableReligions.length > 1 && (
              <select
                value={filterReligion}
                onChange={(e) => setFilterReligion(e.target.value as Religion | '')}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 transition-all appearance-none cursor-pointer"
              >
                <option value="">All Traditions</option>
                {availableReligions.map(religion => (
                  <option key={religion} value={religion}>{religion}</option>
                ))}
              </select>
            )}
          </div>

          {/* Favorites List */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {filteredFavorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                  <Icon name="Heart" className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-600 font-medium mb-1">
                  {searchQuery || filterReligion ? 'No matching prayers' : 'No saved prayers yet'}
                </h3>
                <p className="text-sm text-slate-400">
                  {searchQuery || filterReligion
                    ? 'Try adjusting your search or filter'
                    : 'Save prayers by clicking the heart icon'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredFavorites.map((favorite) => (
                  <div
                    key={favorite.id}
                    className={`glass-card rounded-xl overflow-hidden transition-all duration-300 ${
                      expandedId === favorite.id ? 'ring-2 ring-rose-200' : ''
                    }`}
                  >
                    {/* Card Header */}
                    <div
                      className="p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => handleExpand(favorite.id)}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-slate-900 truncate">
                            {favorite.prayer.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                              <Icon name="Calendar" className="w-3 h-3" />
                              {formatDate(favorite.savedAt)}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                              {favorite.religion}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => handleDelete(favorite.id, e)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            title="Remove from favorites"
                          >
                            <Icon name="Trash2" className="w-4 h-4" />
                          </button>
                          <Icon
                            name={expandedId === favorite.id ? "ChevronLeft" : "ChevronRight"}
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              expandedId === favorite.id ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === favorite.id && (
                      <div className="px-4 pb-4 pt-0 border-t border-slate-100 animate-fade-in">
                        {/* Prayer Body */}
                        <div className="mt-3">
                          <p className="text-sm text-slate-700 italic whitespace-pre-wrap line-clamp-6">
                            {favorite.prayer.prayerBody}
                          </p>
                        </div>

                        {/* Origin */}
                        {favorite.prayer.origin && (
                          <p className="mt-3 text-xs text-slate-500 flex items-center gap-1">
                            <Icon name="BookOpen" className="w-3 h-3" />
                            {favorite.prayer.origin}
                          </p>
                        )}

                        {/* Original Intention */}
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                          <p className="text-xs text-slate-500 mb-1">Original intention:</p>
                          <p className="text-sm text-slate-700">{favorite.situation}</p>
                        </div>

                        {/* Tags */}
                        {favorite.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {favorite.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-rose-50 text-rose-600"
                              >
                                <Icon name="Tag" className="w-3 h-3" />
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* View Full Prayer Button */}
                        {onSelectPrayer && (
                          <button
                            onClick={() => onSelectPrayer(favorite)}
                            className="mt-4 w-full py-2 px-4 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Icon name="BookOpen" className="w-4 h-4" />
                            View Full Prayer
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
