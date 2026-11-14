import React from 'react';
import { useGame } from '../../context/GameContext';
import { ArcadeSlider, ArcadeSwitch } from '@elsesourav/react-ui';
import { Volume2, Vibrate, Compass, Sliders } from 'lucide-react';

export const ProfileSettingsGroup: React.FC = () => {
  const { settings, updateSettings } = useGame();

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
            className="w-full"
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
            className="w-full"
            ariaLabel="Gyroscope Sensitivity"
          />
        </div>
      </div>
    </>
  );
};
