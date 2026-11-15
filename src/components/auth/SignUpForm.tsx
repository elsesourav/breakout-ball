import React, { useState } from 'react';
import { authService } from '../../services/auth';
import { useGame } from '../../context/GameContext';
import { OAuthButtons } from './OAuthButtons';
import { UserPlus, User, AtSign, Mail, KeyRound, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hidden honeypot field for bot protection
  const [honeypot, setHoneypot] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return;
    setError(null);
    setIsLoading(true);
    soundManager.playClick();

    try {
      const res = await authService.registerUser(
        fullName,
        username,
        email,
        password
      );

      if (res.success && res.user) {
        updateUser({
          fullName: res.user.fullName,
          username: res.user.username,
          email: res.user.email,
          avatarUrl: res.user.avatarUrl,
          provider: res.user.provider,
          isLoggedIn: true,
        });
        onSuccess();
      } else {
        setError(res.message || 'Registration failed. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#060a1f',
    border: '1.5px solid rgba(0, 247, 255, 0.3)',
    color: '#ffffff',
  };

  return (
    <div className="w-full flex flex-col">
      {/* Cyber Header */}
      <div className="text-center mb-2.5 flex flex-col items-center">
        <img
          src="/logo.png"
          alt="Breakout Ball"
          style={{ width: '40px', height: '40px' }}
          className="w-10 h-10 mb-2 rounded-full object-cover shadow-[0_0_14px_#ff4500]"
        />
        <h2 className="font-display font-black text-base md:text-lg tracking-wider text-[#00f7ff] [text-shadow:0_0_12px_rgba(0,247,255,0.4)]">
          CREATE ACCOUNT
        </h2>
        <p className="font-ui text-xs text-slate-400 mt-0.5">
          Join the ElseSourav breakout cyber network
        </p>
      </div>

      {/* Social OAuth Options */}
      <OAuthButtons onSuccess={onSuccess} />

      {error && (
        <div className="p-2 mb-2 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 font-tech text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Registration Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
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

        {/* Full Name */}
        <div className="flex flex-col gap-1 text-left">
          <label className="font-tech text-[10px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
            <span>Full Name</span>
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              type="text"
              placeholder="Your Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              style={inputStyle}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-slate-500 outline-none transition-all font-tech tracking-wide shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1 text-left">
          <label className="font-tech text-[10px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
            <span>Username</span>
          </label>
          <div className="relative flex items-center">
            <AtSign className="absolute left-3 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              type="text"
              placeholder="player_one"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              required
              minLength={3}
              style={inputStyle}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-slate-500 outline-none transition-all font-tech tracking-wide shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Email Address */}
        <div className="flex flex-col gap-1 text-left">
          <label className="font-tech text-[10px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
            <span>Email Address</span>
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              type="email"
              placeholder="player@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={inputStyle}
              className="w-full pl-8 pr-3 py-2 text-xs rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-slate-500 outline-none transition-all font-tech tracking-wide shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1 text-left">
          <label className="font-tech text-[10px] font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f7ff]" />
            <span>Password</span>
          </label>
          <div className="relative flex items-center">
            <KeyRound className="absolute left-3 w-3.5 h-3.5 text-cyan-400/70 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={inputStyle}
              className="w-full pl-8 pr-9 py-2 text-xs rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 placeholder:text-slate-500 outline-none transition-all font-tech tracking-wide shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)]"
            />
            <button
              type="button"
              onClick={() => { soundManager.playClick(); setShowPassword(!showPassword); }}
              className="absolute right-2.5 text-slate-400 hover:text-cyan-300 cursor-pointer p-1"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Submit CTA Button */}
        <button
          type="submit"
          disabled={isLoading}
          style={{
            backgroundColor: '#ff0844',
            backgroundImage: 'linear-gradient(135deg, #ff0844 0%, #ff20c4 100%)',
            color: '#ffffff',
            border: '1.5px solid #ffb2d9',
            boxShadow: '0 0 20px rgba(255, 8, 68, 0.5)',
          }}
          className="w-full mt-2 h-10 rounded-xl font-display font-black text-xs tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-white" />
          ) : (
            <>
              <UserPlus className="w-4 h-4 stroke-[2.5]" />
              <span>CREATE ACCOUNT</span>
            </>
          )}
        </button>
      </form>

      {/* Cyber Footer Switch */}
      <div className="text-center mt-3 pt-2.5 border-t border-cyan-500/20 text-xs text-slate-400 font-ui">
        <span>Already have an account? </span>
        <button
          type="button"
          onClick={() => { soundManager.playClick(); onSwitchToLogin(); }}
          className="font-tech font-bold text-cyan-400 hover:text-cyan-300 underline-offset-4 hover:underline tracking-wider uppercase ml-1 cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
};
