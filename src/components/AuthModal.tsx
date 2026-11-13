import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authMode,
    setAuthMode,
    updateUser,
  } = useGame();

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthModalOpen) return null;

  const isSignUp = authMode === 'signup';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalUsername = username.trim() || 'player';
    const finalFullName = fullName.trim() || finalUsername;

    updateUser({
      fullName: finalFullName,
      username: finalUsername,
      email: email.trim(),
      isLoggedIn: true,
    });

    setIsAuthModalOpen(false);
  };

  return (
    <div className="auth-modal-overlay">
      <div className="auth-modal-box">
        <button
          className="auth-modal-close"
          onClick={() => setIsAuthModalOpen(false)}
        >
          <i className="sbi-cross1" />
        </button>

        <h2 className="auth-modal-title">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
        <p className="auth-modal-subtitle">
          {isSignUp ? 'Create a player profile to sync your custom levels' : 'Welcome back to Breakout Ball'}
        </p>

        <form onSubmit={handleSubmit} className="auth-form">
          {isSignUp && (
            <div className="auth-input-group">
              <label>Full Name</label>
              <input
                type="text"
                placeholder="Enter your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="auth-input-group">
            <label>Username</label>
            <input
              type="text"
              placeholder="e.g. breakout_champ"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-submit-btn">
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-modal-switch">
          <span>{isSignUp ? 'Already have an account?' : "Don't have an account?"}</span>
          <button
            type="button"
            className="auth-switch-link"
            onClick={() => setAuthMode(isSignUp ? 'signin' : 'signup')}
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </div>
      </div>
    </div>
  );
};
