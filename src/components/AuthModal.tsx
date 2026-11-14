import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { LoginForm } from './auth/LoginForm';
import { SignUpForm } from './auth/SignUpForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';
import { X } from 'lucide-react';
import { soundManager } from '../utils/audio';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, authMode, setAuthMode } = useGame();
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'forgot-password'>('login');

  useEffect(() => {
    if (authMode === 'signup') {
      setCurrentView('signup');
    } else {
      setCurrentView('login');
    }
  }, [authMode, isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleClose = () => {
    soundManager.playClick();
    setIsAuthModalOpen(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        {/* Cyber Close Button */}
        <button
          type="button"
          className="absolute top-3.5 right-3.5 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 border border-white/15 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer z-10"
          onClick={handleClose}
          title="Close Modal"
        >
          <X className="w-4 h-4" />
        </button>

        {currentView === 'login' && (
          <LoginForm
            onSuccess={() => setIsAuthModalOpen(false)}
            onSwitchToSignUp={() => {
              setAuthMode('signup');
              setCurrentView('signup');
            }}
            onForgotPassword={() => setCurrentView('forgot-password')}
          />
        )}

        {currentView === 'signup' && (
          <SignUpForm
            onSuccess={() => setIsAuthModalOpen(false)}
            onSwitchToLogin={() => {
              setAuthMode('signin');
              setCurrentView('login');
            }}
          />
        )}

        {currentView === 'forgot-password' && (
          <ForgotPasswordForm
            onBackToLogin={() => setCurrentView('login')}
            onSuccess={() => setCurrentView('login')}
          />
        )}
      </div>
    </div>
  );
};
