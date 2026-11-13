import React from 'react';
import { useGame } from '../context/GameContext';
import { ArcadeButton, ArcadeSlider, ArcadeSwitch } from '@elsesourav/react-ui';
import {
  Volume2,
  Vibrate,
  Compass,
  Sliders,
  UserCheck,
  LogIn,
  LogOut,
  Trophy,
  UserPlus,
  ShieldCheck,
  Mail,
  Sparkles,
  Layers,
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const {
    user,
    settings,
    updateSettings,
    updateUser,
    setIsAuthModalOpen,
    setAuthMode,
    localProgress,
    userCreatedLevels,
  } = useGame();

  const handleSignIn = () => {
    setAuthMode('signin');
    setIsAuthModalOpen(true);
  };

  const handleCreateAccount = () => {
    setAuthMode('signup');
    setIsAuthModalOpen(true);
  };

  const handleSignOut = () => {
    updateUser({
      fullName: 'Anonymous',
      username: 'anonymous',
      email: '',
      avatarUrl: undefined,
      provider: undefined,
      isLoggedIn: false,
    });
  };

  // Calculate player progress stats
  const completedCount = Object.values(localProgress).filter((p) => p.completed).length;
  const bestTimes = Object.values(localProgress)
    .map((p) => p.bestTime)
    .filter((t): t is number => typeof t === 'number' && t > 0);
  const bestRecord = bestTimes.length > 0 ? `${Math.min(...bestTimes)}s` : '--';

  // Format initials for avatar
  const displayName = user.isLoggedIn ? (user.fullName || 'Pilot') : 'Anonymous';
  const displayHandle = user.isLoggedIn ? (user.username || 'pilot') : 'anonymous';
  const avatarInitials = user.isLoggedIn
    ? displayHandle.slice(0, 2).toUpperCase()
    : 'AN';

  const providerLabel =
    user.provider === 'google'
      ? 'Google OAuth'
      : user.provider === 'github'
      ? 'GitHub Developer'
      : user.provider === 'sso'
      ? 'ElseSourav SSO'
      : 'ElseSourav ID';

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center px-3.5 py-4 gap-4 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* 1. Hero Player Profile Card */}
      <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-cyan-500/35 p-4 shadow-[0_8px_25px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-xl">
        <div className="flex items-center gap-3.5">
          {/* Glowing Avatar */}
          <div className="relative flex-shrink-0">
            {user.isLoggedIn && user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="w-13 h-13 rounded-full object-cover border-2 border-cyan-400 shadow-[0_0_16px_rgba(0,247,255,0.5)]"
              />
            ) : (
              <div className="w-13 h-13 rounded-full bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[2px] shadow-[0_0_16px_rgba(0,247,255,0.45)]">
                <div className="w-full h-full rounded-full bg-[#070a1a] flex items-center justify-center text-cyan-300 font-tech font-bold text-base tracking-wider">
                  {avatarInitials}
                </div>
              </div>
            )}

            {/* Online / Active Indicator Dot */}
            <span
              className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[#090d24] ${
                user.isLoggedIn
                  ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]'
                  : 'bg-amber-400 shadow-[0_0_6px_#fbbf24]'
              }`}
            />
          </div>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <h2 className="text-base font-bold text-white truncate font-ui tracking-wide">
                {displayName}
              </h2>
              {user.isLoggedIn && (
                <UserCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-cyan-400 font-tech truncate mt-0.5">
              @{displayHandle}
            </p>
          </div>

          {/* Status Badge */}
          <span
            className={`text-[10px] font-tech font-bold px-2 py-0.5 rounded-full border tracking-wider flex-shrink-0 ${
              user.isLoggedIn
                ? 'border-emerald-500/50 text-emerald-300 bg-emerald-950/60 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                : 'border-amber-500/40 text-amber-300 bg-amber-950/50'
            }`}
          >
            {user.isLoggedIn ? 'ONLINE' : 'ANONYMOUS'}
          </span>
        </div>

        {/* Additional Logged-in Identity Details */}
        {user.isLoggedIn && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex flex-col gap-1.5 text-[11px] font-ui">
            {user.email && (
              <div className="flex items-center gap-2 text-slate-300 truncate">
                <Mail className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                <span className="truncate" style={{ color: '#cbd5e1' }}>
                  {user.email}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-slate-400 text-[10px]">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span style={{ color: '#94a3b8' }}>{providerLabel}</span>
              </span>
              <span className="text-emerald-400 font-tech font-bold">
                CLOUD SYNC ACTIVE
              </span>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-white/10 text-center">
          <div className="bg-black/35 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
              <Trophy className="w-3.5 h-3.5 text-yellow-400" />
              <span>Cores</span>
            </div>
            <p className="text-sm font-bold text-white mt-0.5 font-tech">
              {completedCount} <span className="text-slate-400 text-[10px]">/ 20</span>
            </p>
          </div>

          <div className="bg-black/35 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
              <span className="text-cyan-400 text-xs font-mono">⏱</span>
              <span>Best</span>
            </div>
            <p className="text-sm font-bold text-cyan-300 mt-0.5 font-tech">
              {bestRecord}
            </p>
          </div>

          <div className="bg-black/35 rounded-xl p-2 border border-white/5">
            <div className="flex items-center justify-center gap-1 text-[11px] text-slate-300 font-ui font-medium">
              <Layers className="w-3.5 h-3.5 text-purple-400" />
              <span>Created</span>
            </div>
            <p className="text-sm font-bold text-purple-300 mt-0.5 font-tech">
              {userCreatedLevels.length}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Authentication Actions: Separate SIGN IN and CREATE ACCOUNT Buttons */}
      {!user.isLoggedIn ? (
        <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
          <div className="flex items-center gap-1.5 text-cyan-400 text-[11px] font-display font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ElseSourav Account Access</span>
          </div>

          <p className="text-xs text-slate-300 font-ui leading-relaxed" style={{ color: '#cbd5e1' }}>
            Playing as <strong style={{ color: '#00f7ff' }}>Anonymous</strong> saves data locally.
            Sign in or create an account to sync progress and compete globally.
          </p>

          {/* TWO SEPARATE BUTTONS AS REQUESTED */}
          <div className="grid grid-cols-2 gap-2 mt-1">
            {/* 1. SIGN IN BUTTON */}
            <ArcadeButton
              variant="cyan"
              size="md"
              shape="rounded"
              mask={true}
              glow={true}
              onClick={handleSignIn}
              className="w-full py-2.5 font-display font-bold tracking-wider text-xs flex items-center justify-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>SIGN IN</span>
            </ArcadeButton>

            {/* 2. CREATE ACCOUNT BUTTON */}
            <ArcadeButton
              variant="magenta"
              size="md"
              shape="rounded"
              mask={true}
              glow={true}
              onClick={handleCreateAccount}
              className="w-full py-2.5 font-display font-bold tracking-wider text-xs flex items-center justify-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>CREATE</span>
            </ArcadeButton>
          </div>
        </div>
      ) : (
        /* Logged In Sign Out Button */
        <div className="w-full max-w-sm">
          <ArcadeButton
            variant="magenta"
            size="md"
            shape="rounded"
            mask={true}
            glow={true}
            onClick={handleSignOut}
            className="w-full py-2.5 font-display font-bold tracking-wider text-xs flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>SIGN OUT</span>
          </ArcadeButton>
        </div>
      )}

      {/* 3. Audio & Haptics Group */}
      <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-cyan-400 text-[11px] font-display font-bold uppercase tracking-wider">
          <Volume2 className="w-3.5 h-3.5" />
          <span>Sound & Feedback</span>
        </div>

        {/* Master Volume */}
        <div className="flex flex-col gap-1.5 font-ui">
          <div className="flex justify-between items-center text-xs">
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Master Volume</span>
          </div>
          <ArcadeSlider
            value={settings.volume}
            onChange={(val) => updateSettings({ volume: val })}
            min={0}
            max={1}
            step={0.01}
            variant="neon-cyan"
            size="md"
            showBezel={true}
            showGlow={true}
            showValue={true}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            className="w-full"
            ariaLabel="Master Volume"
          />
        </div>

        {/* Vibration Toggle */}
        <div className="flex justify-between items-center pt-1 font-ui">
          <div className="flex items-center gap-2">
            <Vibrate className="w-4 h-4 text-emerald-400" style={{ color: '#34d399' }} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>Vibration Haptics</span>
              <span className="text-[11px]" style={{ color: '#cbd5e1' }}>Touch & collision buzz</span>
            </div>
          </div>
          <ArcadeSwitch
            checked={settings.vibrate}
            onChange={(checked) => updateSettings({ vibrate: checked })}
            variant="neon-green"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            showBezel={true}
            showGlow={true}
            ariaLabel="Vibration Toggle"
          />
        </div>
      </div>

      {/* 4. Controls & Simulation Group */}
      <div className="w-full max-w-sm rounded-2xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-1.5 pb-2 border-b border-white/10 text-purple-400 text-[11px] font-display font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Controls & Simulation</span>
        </div>

        {/* Gyroscope Tilt */}
        <div className="flex justify-between items-center font-ui">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-400" style={{ color: '#c084fc' }} />
            <div className="flex flex-col">
              <span className="text-xs font-semibold" style={{ color: '#ffffff' }}>Gyroscope Tilt</span>
              <span className="text-[11px]" style={{ color: '#cbd5e1' }}>Tilt device to steer paddle</span>
            </div>
          </div>
          <ArcadeSwitch
            checked={settings.gyroscope}
            onChange={(checked) => updateSettings({ gyroscope: checked })}
            variant="cyber-purple"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            showBezel={true}
            showGlow={true}
            ariaLabel="Gyroscope Toggle"
          />
        </div>

        {/* Gyroscope Sensitivity Slider */}
        <div className="flex flex-col gap-1.5 pt-1 font-ui">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" style={{ color: '#f472b6' }} />
              <span style={{ color: '#ffffff', fontWeight: 600 }}>Tilt Sensitivity</span>
            </div>
          </div>
          <ArcadeSlider
            value={settings.gyroSensitivity}
            onChange={(val) => updateSettings({ gyroSensitivity: val })}
            min={0.05}
            max={0.7}
            step={0.01}
            variant="candy-pink"
            size="md"
            showBezel={true}
            showGlow={true}
            showValue={true}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            className="w-full"
            ariaLabel="Gyroscope Sensitivity"
          />
        </div>
      </div>

      {/* 5. Minimal Ecosystem Footer */}
      <footer className="text-center text-xs text-slate-300 font-mono mt-1" style={{ color: '#cbd5e1' }}>
        <span>Breakout Ball V2 • Ecosystem by </span>
        <a
          href="https://elsesourav.com"
          target="_blank"
          rel="noreferrer"
          className="text-cyan-300 font-bold hover:underline"
        >
          ElseSourav
        </a>
      </footer>
    </div>
  );
};
