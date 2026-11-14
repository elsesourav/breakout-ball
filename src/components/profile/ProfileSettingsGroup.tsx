import React from 'react';
import { useGame } from '../../context/GameContext';
import { ArcadeSlider, ArcadeSwitch } from '@elsesourav/react-ui';
import { Volume2, Vibrate, Compass, Sliders, Trash2 } from 'lucide-react';

export const ProfileSettingsGroup: React.FC = () => {
  const { settings, updateSettings, showAlert } = useGame();

  const handleResetProgress = () => {
    showAlert({
      title: 'RESET PROGRESS?',
      message: 'This will reset your local campaign progress back to Core 01. This action cannot be undone.',
      titleColor: '#ef4444',
      btn1Text: 'CANCEL',
      btn1Color: '#94a3b8',
      btn2Text: 'RESET ALL',
      btn2Color: '#ef4444',
      onConfirm: () => {
        localStorage.removeItem('breakout_db_progress');
        window.location.reload();
      },
    });
  };

  return (
    <>
      {/* Audio & Haptics Settings */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-cyan-400 text-xs font-display font-black tracking-wider uppercase">
          <Volume2 className="w-4 h-4 text-cyan-400" />
          <span>Sound & Feedback</span>
        </div>

        {/* Master Volume */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between items-center text-xs">
            <span className="font-settings-title text-xs font-bold text-white tracking-wider">
              MASTER VOLUME
            </span>
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
            className="w-full font-tech"
            ariaLabel="Master Volume"
          />
        </div>

        {/* Vibration Toggle */}
        <div className="flex justify-between items-center pt-1">
          <div className="flex items-center gap-2.5">
            <Vibrate className="w-4 h-4 text-emerald-400 flex-shrink-0" style={{ color: '#34d399' }} />
            <div className="flex flex-col">
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                VIBRATION HAPTICS
              </span>
              <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
                Touch & collision haptic buzz
              </span>
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
            className="font-tech"
            ariaLabel="Vibration Toggle"
          />
        </div>
      </div>

      {/* Controls & Simulation Settings */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-3 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-purple-400 text-xs font-display font-black tracking-wider uppercase">
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
            className="font-tech"
            ariaLabel="Gyroscope Toggle"
          />
        </div>

        {/* Gyroscope Sensitivity Slider */}
        <div className="flex flex-col gap-1.5 pt-1">
          <div className="flex justify-between items-center text-xs">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-pink-400" style={{ color: '#f472b6' }} />
              <span className="font-settings-title text-xs font-bold text-white tracking-wider">
                TILT SENSITIVITY
              </span>
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
            className="w-full font-tech"
            ariaLabel="Gyroscope Sensitivity"
          />
        </div>
      </div>

      {/* Data Management & Storage */}
      <div className="w-full max-w-sm rounded-xl bg-[#090d24]/90 border border-white/10 p-3.5 flex flex-col gap-2.5 shadow-lg backdrop-blur-xl">
        <div className="flex items-center gap-2 pb-2 border-b border-white/10 text-slate-300 text-xs font-display font-black tracking-wider uppercase">
          <Trash2 className="w-4 h-4 text-red-400" />
          <span>Data & Storage</span>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex flex-col">
            <span className="font-settings-title text-xs font-bold text-white tracking-wider">
              RESET CAMPAIGN
            </span>
            <span className="font-settings-desc text-[11px] text-slate-400 mt-0.5">
              Reset stage unlocks & best records
            </span>
          </div>

          <button
            type="button"
            onClick={handleResetProgress}
            className="px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-tech font-bold text-xs transition-all active:scale-95 cursor-pointer"
          >
            RESET
          </button>
        </div>
      </div>
    </>
  );
};
