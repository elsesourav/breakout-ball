import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { useGame } from '../../context/GameContext';
import { OAuthButtons } from './OAuthButtons';
import { ArcadeButton } from '@elsesourav/react-ui';

interface LoginFormProps {
  onSuccess: () => void;
  onSwitchToSignUp: () => void;
  onForgotPassword: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onSwitchToSignUp,
  onForgotPassword,
}) => {
  const { updateUser } = useGame();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await authService.loginWithIdentifier(identifier, password);
      if (res.success && res.user) {
        updateUser({
          fullName: res.user.fullName,
          username: res.user.username,
          email: res.user.email,
          isLoggedIn: true,
        });
        onSuccess();
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-3">
        <h2 className="text-xl font-bold font-sans text-cyan-300 tracking-wide">
          Welcome Back
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sign in with your Email or @Username
        </p>
      </div>

      {/* OAuth Social Buttons */}
      <OAuthButtons onSuccess={onSuccess} />

      {error && (
        <div className="p-2 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
          {error}
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1 text-left">
          <label className="text-[11px] font-semibold text-slate-300">
            Email or Username
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="user@example.com or @username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="w-full px-3 py-2 text-xs rounded-xl bg-surface/70 border border-border focus:border-primary text-white outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <div className="flex justify-between items-center">
            <label className="text-[11px] font-semibold text-slate-300">Password</label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-[10px] text-cyan-400 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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
          variant="cyan"
          size="md"
          shape="rounded"
          mask={true}
          glow={true}
          isLoading={isLoading}
          onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}
          className="w-full mt-2 py-2 text-sm tracking-wider font-bold"
        >
          Sign In
        </ArcadeButton>
      </form>

      {/* Clean Footer Exclusively with Prompt */}
      <div className="text-center mt-4 pt-3 border-t border-white/10 text-xs text-slate-400">
        <span>Do not have an account? </span>
        <button
          type="button"
          onClick={onSwitchToSignUp}
          className="text-cyan-400 font-semibold hover:underline"
        >
          Create an account
        </button>
      </div>
    </div>
  );
};
