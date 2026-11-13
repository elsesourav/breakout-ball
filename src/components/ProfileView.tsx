import React from 'react';
import { useGame } from '../context/GameContext';
import { ArcadeButton, ArcadeSlider, ArcadeSwitch } from '@elsesourav/react-ui';

export const ProfileView: React.FC = () => {
  const { user, settings, updateSettings, updateUser, setIsAuthModalOpen, setAuthMode } = useGame();

  const handleAuthAction = () => {
    if (user.isLoggedIn) {
      updateUser({
        fullName: 'Guest Player',
        username: 'guest',
        email: '',
        isLoggedIn: false,
      });
    } else {
      setAuthMode('signin');
      setIsAuthModalOpen(true);
    }
  };

  return (
    <div className="map active profile pb-8">
      {/* User Header Card */}
      <div className="user shadow-md">
        <div className="icon">
          <i className="sbi-user1" />
        </div>
        <div className="name">
          <p id="fullName">{user.fullName}</p>
          <p id="username">@{user.username}</p>
        </div>
      </div>

      <div className="w-[92%] flex flex-col gap-3 my-1">
        {/* Master Volume */}
        <div className="option flex-col !items-start gap-1 p-3">
          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold uppercase tracking-wider mb-1">
            <i className="sbi-volume-medium text-base" />
            <span>Master Volume</span>
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

        {/* Vibration Switch */}
        <div className="option flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <i className="sbi-vibration text-emerald-400 text-base" />
            <span className="font-semibold text-sm">Vibration Haptics</span>
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

        {/* Gyroscope Switch */}
        <div className="option flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <i className="sbi-screen-rotation text-purple-400 text-base" />
            <span className="font-semibold text-sm">Gyroscope Tilt</span>
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

        {/* WASM WebGL Particle Background */}
        <div className="option flex justify-between items-center p-3">
          <div className="flex items-center gap-2">
            <i className="sbi-stars text-cyan-400 text-base" />
            <div className="flex flex-col">
              <span className="font-semibold text-sm">WASM Particles</span>
              <span className="text-[10px] text-slate-400">Locked 60fps C++ WebGL</span>
            </div>
          </div>
          <ArcadeSwitch
            checked={settings.wasmParticles ?? true}
            onChange={(checked) => updateSettings({ wasmParticles: checked })}
            variant="neon-cyan"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            showBezel={true}
            showGlow={true}
            ariaLabel="WASM Particles Toggle"
          />
        </div>

        {/* Gyro Sensitivity */}
        <div className="option flex-col !items-start gap-1 p-3">
          <div className="flex items-center gap-2 text-pink-400 text-xs font-bold uppercase tracking-wider mb-1">
            <i className="sbi-screen-rotation text-base" />
            <span>Tilt Sensitivity</span>
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

      {/* Auth Action Button */}
      <div className="w-[92%] mt-2">
        <ArcadeButton
          variant={user.isLoggedIn ? 'magenta' : 'cyan'}
          size="md"
          shape="rounded"
          mask={true}
          glow={true}
          onClick={handleAuthAction}
          className="w-full py-2.5 font-bold tracking-wider"
        >
          {user.isLoggedIn ? 'Sign Out' : 'Sign In / Sign Up'}
        </ArcadeButton>
      </div>

      <a
        href="https://github.com/elsesourav"
        id="copyright"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 text-xs opacity-60 hover:opacity-100 transition-opacity"
      >
        &copy; SouravBarui2024 • Components by @elsesourav
      </a>
    </div>
  );
};
