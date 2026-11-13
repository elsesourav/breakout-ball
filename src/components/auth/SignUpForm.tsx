import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { useGame } from '../../context/GameContext';
import { OAuthButtons } from './OAuthButtons';
import { ArcadeButton } from '@elsesourav/react-ui';

interface SignUpFormProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const { updateUser } = useGame();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [honeypot, setHoneypot] = useState(''); // Anti-bot honeypot
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bots
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.registerUser(fullName, username, email, password);
      if (res.success && res.user) {
        updateUser({
          fullName: res.user.fullName,
          username: res.user.username,
          email: res.user.email,
          isLoggedIn: true,
        });
        onSuccess();
      } else {
        setError(res.message || 'Registration failed. Please check your inputs.');
      }
    } catch {
      setError('An error occurred during registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-2">
        <h2 className="text-xl font-bold font-sans text-cyan-300 tracking-wide">
          Create Account
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Join the ElseSourav arcade ecosystem
        </p>
      </div>

      <OAuthButtons onSuccess={onSuccess} />

      {error && (
        <div className="p-2 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5">
        {/* Anti-bot hidden honeypot */}
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[11px] font-semibold text-slate-300">Full Name</label>
          <input
            type="text"
            placeholder="Your Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[11px] font-semibold text-slate-300">Username</label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-xs text-slate-500 font-mono select-none">@</span>
            <input
              type="text"
              placeholder="player_one"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              style={{ paddingLeft: '28px' }}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[11px] font-semibold text-slate-300">Email Address</label>
          <input
            type="email"
            placeholder="player@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
          />
        </div>

        <div className="flex flex-col gap-1 text-left">
          <label className="text-[11px] font-semibold text-slate-300">Password</label>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 pr-9 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 text-slate-400 hover:text-white text-xs"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '🔒'}
            </button>
          </div>
        </div>

        <ArcadeButton
          variant="magenta"
          size="md"
          shape="rounded"
          mask={true}
          glow={true}
          isLoading={isLoading}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          className="w-full mt-2 py-2 text-sm tracking-wider font-bold"
        >
          Create Account
        </ArcadeButton>
      </form>

      <div className="text-center mt-3 pt-3 border-t border-white/10 text-xs text-slate-400">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-cyan-400 font-semibold hover:underline"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
