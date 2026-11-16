import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { CustomCyberSlider } from '../common/CustomCyberSlider';
import { CustomCyberSwitch } from '../common/CustomCyberSwitch';
import { Volume2, VolumeX, Music, Zap, MousePointer, Vibrate, Compass, Sliders, Trash2, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../audio';

export const ProfileSettingsGroup: React.FC = () => {
  const { settings, updateSettings } = useGame();
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetInputText, setResetInputText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleOpenReset = () => {
    soundManager.play('click');
    setResetInputText('');
    setIsResetModalOpen(true);
  };

  const isMatch = resetInputText.trim().toLowerCase() === 'reset all';

  const handleConfirmReset = () => {
    if (!isMatch) return;
    setIsResetting(true);
    soundManager.play('damage');
    setTimeout(() => {
      // Clear all breakout game localStorage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('breakout_') || key.includes('breakout'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
      // Force reload to completely reset game engine & progress state
      window.location.reload();
    }, 400);
  };

  return (
    <>
      {/* Audio & Haptics Settings */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-cyan-500/25 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center justify-between pb-2 border-b border-cyan-500/15 text-xs font-display font-black tracking-wider uppercase">
          <div className="flex items-center gap-2 text-cyan-400">
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            <span>Sound & Feedback</span>
          </div>
          <span className={`text-[9px] font-tech font-bold px-1.5 py-0.5 rounded border ${
            settings.soundEnabled
              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40 shadow-[0_0_8px_rgba(0,247,255,0.3)]'
              : 'bg-slate-800/60 text-slate-400 border-slate-700'
          }`}>
            {settings.soundEnabled ? 'AUDIO ON' : 'AUDIO MUTED'}
          </span>
        </div>

        {/* 1. Master Audio Switch (DEFAULT: OFF) */}
        <div className="flex justify-between items-center py-1">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${
              settings.soundEnabled
                ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300 shadow-[0_0_10px_rgba(0,247,255,0.3)]'
                : 'bg-slate-800/60 border-slate-700 text-slate-500'
            }`}>
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                MASTER AUDIO
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                {settings.soundEnabled ? 'All audio streams active (Default ON)' : 'All audio streams muted'}
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.soundEnabled}
            onChange={(checked) => updateSettings({ soundEnabled: checked })}
            variant="neon-cyan"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Master Audio Toggle"
          />
        </div>

        {/* 2. Master Volume Slider (DEFAULT: 50%) */}
        <div className={`flex flex-col gap-1.5 transition-opacity ${settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex justify-between items-center text-xs">
            <span className="font-settings-title text-xs font-bold text-white tracking-wider">
              MASTER VOLUME
            </span>
          </div>
          <CustomCyberSlider
            value={settings.volume}
            onChange={(val) => updateSettings({ volume: val })}
            min={0}
            max={1}
            step={0.01}
            variant="neon-cyan"
            size="md"
            showValue={true}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            className="w-full font-tech"
            ariaLabel="Master Volume"
          />
        </div>

        {/* 3. Background Music Toggle (DEFAULT: OFF) */}
        <div className={`flex justify-between items-center pt-1 transition-opacity ${settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-2.5">
            <Music className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                BACKGROUND MUSIC
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                Ambient cyber combat tracks
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.musicEnabled}
            onChange={(checked) => updateSettings({ musicEnabled: checked })}
            variant="cyber-purple"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Background Music Toggle"
          />
        </div>

        {/* 4. Action Sounds (SFX) Toggle */}
        <div className={`flex justify-between items-center pt-1 transition-opacity ${settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                ACTION SOUNDS (SFX)
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                Ball bounces, block hits & combos
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.sfxEnabled}
            onChange={(checked) => updateSettings({ sfxEnabled: checked })}
            variant="neon-green"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Action Sounds Toggle"
          />
        </div>

        {/* 5. Button Clicks Toggle */}
        <div className={`flex justify-between items-center pt-1 transition-opacity ${settings.soundEnabled ? 'opacity-100' : 'opacity-40 pointer-events-none'}`}>
          <div className="flex items-center gap-2.5">
            <MousePointer className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                BUTTON & MENU CLICKS
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                High-tech tactile UI clicks
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.clickSoundEnabled}
            onChange={(checked) => updateSettings({ clickSoundEnabled: checked })}
            variant="neon-cyan"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Button Clicks Toggle"
          />
        </div>

        {/* 6. Vibration Haptics Toggle (DEFAULT: ON) */}
        <div className="flex justify-between items-center pt-1 border-t border-cyan-500/10">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-emerald-400 flex-shrink-0" style={{ color: '#34d399' }} />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                VIBRATION HAPTICS
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                Touch & collision haptic buzz (Active)
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.vibrate}
            onChange={(checked) => updateSettings({ vibrate: checked })}
            variant="neon-green"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Vibration Toggle"
          />
        </div>
      </div>

      {/* Controls & Simulation Settings */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-cyan-500/25 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15 text-purple-400 text-xs font-display font-black tracking-wider uppercase">
          <Compass className="w-4 h-4 text-purple-400" />
          <span>Controls & Simulation</span>
        </div>

        {/* Gyroscope Tilt */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-purple-400 flex-shrink-0" style={{ color: '#c084fc' }} />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                GYROSCOPE TILT
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                Tilt hardware to steer paddle
              </span>
            </div>
          </div>
          <CustomCyberSwitch
            checked={settings.gyroscope}
            onChange={(checked) => updateSettings({ gyroscope: checked })}
            variant="cyber-purple"
            size="md"
            showText={true}
            onLabel="ON"
            offLabel="OFF"
            className="font-tech"
            ariaLabel="Gyroscope Toggle"
          />
        </div>

        {/* Gyroscope Sensitivity Slider (Disabled when Gyroscope is OFF) */}
        <div
          className={`flex flex-col gap-1.5 pt-1 transition-all duration-200 ${
            !settings.gyroscope ? 'opacity-40 pointer-events-none select-none' : 'opacity-100'
          }`}
        >
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <Sliders
                className="w-3.5 h-3.5"
                style={{ color: settings.gyroscope ? '#f472b6' : '#94a3b8' }}
              />
              <span
                className={`font-settings-title text-xs font-bold tracking-wider ${
                  settings.gyroscope ? 'text-white' : 'text-slate-400'
                }`}
              >
                TILT SENSITIVITY
              </span>
            </div>
            {!settings.gyroscope && (
              <span className="font-tech text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                DISABLED
              </span>
            )}
          </div>
          <CustomCyberSlider
            value={settings.gyroSensitivity}
            onChange={(val) => updateSettings({ gyroSensitivity: val })}
            min={0.05}
            max={0.7}
            step={0.01}
            variant="candy-pink"
            size="md"
            showValue={true}
            disabled={!settings.gyroscope}
            formatValue={(v) => `${Math.round(v * 100)}%`}
            className="w-full font-tech"
            ariaLabel="Gyroscope Sensitivity"
          />
        </div>
      </div>

      {/* Data Management & Storage */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-cyan-500/25 p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-cyan-500/15 text-slate-300 text-xs font-display font-black tracking-wider uppercase">
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Data & Storage</span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex flex-col">
            <span className="font-settings-title text-xs font-bold text-white tracking-wider">
              RESET ALL DATA
            </span>
            <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
              Wipe all progress, records & local stages
            </span>
          </div>

          <button
            type="button"
            onClick={handleOpenReset}
            className="px-3.5 py-1.5 rounded-xl border border-red-500/40 bg-red-500/15 hover:bg-red-500/25 text-red-400 font-tech font-bold text-xs transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(239,68,68,0.2)]"
          >
            RESET ALL
          </button>
        </div>
      </div>

      {/* High-Stakes Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div
            className="w-full max-w-sm rounded-2xl bg-[#080c24] border-2 border-red-500/60 p-5 shadow-[0_0_35px_rgba(239,68,68,0.4)] flex flex-col gap-4 text-white relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with warning icon */}
            <div className="flex items-center gap-3 pb-3 border-b border-red-500/30">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(239,68,68,0.3)]">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-display font-black text-sm text-red-400 tracking-wider">
                  CONFIRM SYSTEM RESET
                </h3>
                <span className="font-mono text-[10px] text-red-300/80">
                  PERMANENT DELETION
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="font-ui text-xs text-slate-300 leading-relaxed">
              This action will permanently wipe all campaign core progress, high scores, custom designed stages, and achievements.
            </p>

            {/* Instruction */}
            <div className="flex flex-col gap-1.5">
              <label className="font-ui text-xs text-slate-300 flex items-center gap-1 flex-wrap">
                <span>To confirm, please type</span>
                <span className="font-mono font-bold text-red-400 bg-red-950/60 px-1.5 py-0.5 rounded border border-red-500/40">
                  reset all
                </span>
                <span>below:</span>
              </label>

              <input
                type="text"
                value={resetInputText}
                onChange={(e) => setResetInputText(e.target.value)}
                placeholder="Type 'reset all'"
                autoFocus
                className="w-full px-3 py-2 rounded-xl bg-black/70 border border-red-500/50 text-white font-mono text-center font-bold text-sm tracking-wider focus:border-red-400 focus:shadow-[0_0_16px_rgba(239,68,68,0.4)] transition-all outline-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => {
                  soundManager.play('click');
                  setIsResetModalOpen(false);
                }}
                className="h-10 rounded-xl border border-cyan-500/30 bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-200 font-tech font-bold text-xs tracking-wider transition-all active:scale-95 cursor-pointer"
              >
                CANCEL
              </button>

              <button
                type="button"
                disabled={!isMatch || isResetting}
                onClick={handleConfirmReset}
                style={
                  isMatch && !isResetting
                    ? {
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        border: '1.5px solid #ef4444',
                        boxShadow: '0 0 20px rgba(239, 68, 68, 0.75)',
                        color: '#ffffff',
                        opacity: 1,
                        cursor: 'pointer',
                      }
                    : {
                        background: 'rgba(239, 68, 68, 0.08)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        color: 'rgba(239, 68, 68, 0.4)',
                        opacity: 0.4,
                        cursor: 'not-allowed',
                      }
                }
                className="h-10 rounded-xl font-tech font-black text-xs tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isResetting ? 'RESETTING...' : 'RESET ALL'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
