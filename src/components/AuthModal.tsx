import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { LoginForm } from './auth/LoginForm';
import { SignUpForm } from './auth/SignUpForm';
import { ForgotPasswordForm } from './auth/ForgotPasswordForm';

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

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        <button
          className="auth-modal-close"
          onClick={() => setIsAuthModalOpen(false)}
          title="Close Modal"
        >
          <i className="sbi-cross1" />
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
