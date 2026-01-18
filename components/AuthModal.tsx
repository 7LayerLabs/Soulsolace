import React, { useState } from 'react';
import { Icon } from './Icon';
import { sendMagicLink, verifyMagicCode } from '../services/instantdb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await sendMagicLink(email);

    setIsLoading(false);

    if (result.success) {
      setStep('code');
    } else {
      setError('Failed to send code. Please try again.');
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    setError(null);

    const result = await verifyMagicCode(email, code);

    setIsLoading(false);

    if (result.success) {
      onClose();
    } else {
      setError('Invalid code. Please try again.');
    }
  };

  const handleBack = () => {
    setStep('email');
    setCode('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <Icon name="X" className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-amber-100 rounded-full mb-4">
            <Icon name="User" className="w-6 h-6 text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {step === 'email' ? 'Sign In' : 'Enter Code'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {step === 'email'
              ? 'Sign in to save your preferences'
              : `We sent a code to ${email}`}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        {step === 'email' ? (
          <form onSubmit={handleSendCode}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? 'Sending...' : 'Send Magic Link'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Verification code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter 6-digit code"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all text-center text-2xl tracking-widest"
                maxLength={6}
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length < 6}
              className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all mb-3"
            >
              {isLoading ? 'Verifying...' : 'Verify Code'}
            </button>

            <button
              type="button"
              onClick={handleBack}
              className="w-full py-2 text-slate-500 hover:text-slate-700 text-sm transition-colors"
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Footer */}
        <p className="text-xs text-slate-400 text-center mt-6">
          We'll send you a magic link to sign in without a password.
        </p>
      </div>
    </div>
  );
};
