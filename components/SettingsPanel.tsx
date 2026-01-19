import React, { useState } from 'react';
import { Icon } from './Icon';
import { Religion, ReligionOption } from '../types';
import { RELIGIONS } from '../constants';
import { useAuth, useUserPreferences, setUserReligion, signOut } from '../services/instantdb';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSignInClick: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onSignInClick
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { religion: savedReligion, isLoading: prefsLoading } = useUserPreferences();
  const [selectedReligion, setSelectedReligion] = useState<Religion | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  if (!isOpen) return null;

  const currentReligion = selectedReligion || savedReligion;

  const handleReligionChange = async (religion: Religion) => {
    if (!user) return;

    setSelectedReligion(religion);
    setIsSaving(true);

    const result = await setUserReligion(user.id, religion);

    setIsSaving(false);

    if (result.success) {
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 2000);
    }
  };

  const handleSignOut = () => {
    signOut();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white shadow-2xl h-full overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 sm:gap-3">
            <Icon name="Settings" className="w-5 h-5 text-slate-600" />
            <h2 className="text-base sm:text-lg font-semibold text-slate-900">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <Icon name="X" className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          {/* Account Section */}
          <section className="mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Account
            </h3>

            {authLoading ? (
              <div className="animate-pulse bg-slate-100 h-20 rounded-xl" />
            ) : user ? (
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Icon name="User" className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{user.email}</p>
                    <p className="text-xs text-slate-500">Signed in</p>
                  </div>
                </div>
                <button
                  onClick={handleSignOut}
                  className="w-full py-2 text-sm text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Icon name="LogOut" className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 rounded-xl p-4 text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Sign in to save your preferences across devices
                </p>
                <button
                  onClick={onSignInClick}
                  className="px-6 py-2 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 mx-auto"
                >
                  <Icon name="LogIn" className="w-4 h-4" />
                  Sign In
                </button>
              </div>
            )}
          </section>

          {/* Religion Preference Section */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Your Tradition
              </h3>
              {showSaved && (
                <span className="text-xs text-green-600 flex items-center gap-1">
                  <Icon name="Check" className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>

            {!user ? (
              <p className="text-sm text-slate-500 italic">
                Sign in to save your preferred tradition
              </p>
            ) : prefsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-slate-100 h-14 rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {RELIGIONS.map((rel) => (
                  <button
                    key={rel.id}
                    onClick={() => handleReligionChange(rel.id)}
                    disabled={isSaving}
                    className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      currentReligion === rel.id
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${rel.color}`}>
                      <Icon name={rel.icon} className="w-5 h-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-slate-900">{rel.name}</p>
                      <p className="text-xs text-slate-500 truncate">{rel.description}</p>
                    </div>
                    {currentReligion === rel.id && (
                      <Icon name="Check" className="w-5 h-5 text-amber-600" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* About Section */}
          <section>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              About
            </h3>
            <div className="text-sm text-slate-600 space-y-2">
              <p>
                SoulSolace helps you find authentic prayers from your spiritual tradition.
              </p>
              <p className="text-xs text-slate-400">
                Version 1.0.0
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
