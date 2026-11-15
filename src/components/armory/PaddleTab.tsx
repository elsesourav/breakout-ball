import React from 'react';
import { PADDLE_UPGRADES, UpgradeState, getUpgradeCost } from '../../constants/upgrades';
import { UpgradeCard } from './UpgradeCard';
import { GamePaddleIcon } from './InGameIcons';

interface PaddleTabProps {
  upgrades: UpgradeState;
  cores: number;
  onUpgrade: (id: string) => void;
}

export const PaddleTab: React.FC<PaddleTabProps> = ({ upgrades, cores, onUpgrade }) => {
  const widthLvl = upgrades['paddle_width'] || 1;
  const speedLvl = upgrades['paddle_speed'] || 1;

  // Visual width scaling based on level: Base 140px, grows to 240px
  const visualWidth = Math.min(260, 140 + (widthLvl - 1) * 16);
  // Thruster pulse speed multiplier
  const thrustSpeed = 1 + (speedLvl - 1) * 0.15;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* 1. Live 3D In-Game Paddle Visualizer */}
      <div
        style={{
          backgroundColor: 'rgba(8, 13, 38, 0.94)',
          border: '1.2px solid rgba(0, 247, 255, 0.35)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), 0 0 16px rgba(0, 247, 255, 0.15)',
          borderRadius: '18px',
        }}
        className="p-4 flex flex-col items-center gap-3 relative overflow-hidden"
      >
        <div className="w-full flex items-center justify-between text-[10px] font-tech text-cyan-400 uppercase tracking-widest">
          <span className="flex items-center gap-1.5 font-bold">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping inline-block" />
            LIVE PADDLE CHASSIS
          </span>
          <span className="text-slate-400">TITAN-X PLATFORM</span>
        </div>

        {/* Dynamic In-Game Drawn 3D Paddle Display */}
        <div
          style={{ border: '1px solid rgba(0, 247, 255, 0.22)' }}
          className="w-full h-24 flex items-center justify-center relative bg-black/40 rounded-xl overflow-hidden"
        >
          {/* Background gridlines */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,247,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(0,247,255,0.4) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />

          {/* 3D Paddle with Dynamic Width & Thrusters */}
          <div className="flex items-center justify-center relative transition-all duration-500 ease-out">
            {/* Left Twin Plasma Thruster */}
            <div
              style={{
                width: `${10 * thrustSpeed}px`,
                boxShadow: '0 0 14px #ffaa00',
              }}
              className="h-3 rounded-l-full bg-gradient-to-r from-transparent via-amber-400 to-orange-500 animate-pulse"
            />

            {/* In-Game 3D Cylindrical Paddle Body */}
            <div
              style={{
                width: `${visualWidth}px`,
                height: '24px',
                background: 'linear-gradient(180deg, #59f7ff 0%, #0055ff 30%, #6700ff 70%, #001a40 100%)',
                border: '2.5px solid #ffffff',
                boxShadow: '0 0 20px rgba(0, 247, 255, 0.75), 0 6px 12px rgba(0, 0, 0, 0.7)',
                borderRadius: '12px',
                transition: 'width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
              className="relative flex items-center justify-center shadow-lg"
            >
              {/* Top Specular Highlight Bar */}
              <div className="absolute top-1 left-3 right-3 h-2 rounded-full bg-white/70" />

              {/* Glowing Center Reactor Core Slot */}
              <div
                style={{
                  width: '36%',
                  height: '7px',
                  backgroundColor: '#00f7ff',
                  boxShadow: '0 0 12px #00f7ff, 0 0 20px #00f7ff',
                  borderRadius: '2px',
                }}
                className="animate-pulse"
              />
            </div>

            {/* Right Twin Plasma Thruster */}
            <div
              style={{
                width: `${10 * thrustSpeed}px`,
                boxShadow: '0 0 14px #ffaa00',
              }}
              className="h-3 rounded-r-full bg-gradient-to-l from-transparent via-amber-400 to-orange-500 animate-pulse"
            />
          </div>

          {/* Width Dimension Indicator */}
          <div className="absolute bottom-1.5 flex items-center gap-1 font-mono text-[9px] text-cyan-300/80">
            <span>◀</span>
            <span className="font-bold tracking-wider">{visualWidth}PX SPAN (+{(widthLvl - 1) * 8}%)</span>
            <span>▶</span>
          </div>
        </div>

        {/* Realtime Stat Badges */}
        <div className="w-full grid grid-cols-2 gap-2 text-center">
          <div className="p-2 rounded-xl bg-black/50 border border-cyan-500/20 flex flex-col items-center">
            <span className="text-[9px] font-tech text-slate-400 uppercase">CALIBRATED WIDTH</span>
            <span className="font-tech font-black text-sm text-cyan-300">
              +{widthLvl * 8}% EXPANDED
            </span>
          </div>
          <div className="p-2 rounded-xl bg-black/50 border border-amber-500/20 flex flex-col items-center">
            <span className="text-[9px] font-tech text-slate-400 uppercase">IMPULSE VELOCITY</span>
            <span className="font-tech font-black text-sm text-amber-300">
              +{speedLvl * 10}% AGILITY
            </span>
          </div>
        </div>
      </div>

      {/* 2. Paddle Upgrade Cards */}
      <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1 pt-1">
        <span>🏓 PADDLE MODULES</span>
        <span>LEVEL 1–8</span>
      </div>

      <div className="flex flex-col gap-2.5">
        {PADDLE_UPGRADES.map((upgrade) => {
          const level = upgrades[upgrade.id] || 1;
          const cost = getUpgradeCost(upgrade.baseCost, level);
          const isWidth = upgrade.id === 'paddle_width';

          return (
            <UpgradeCard
              key={upgrade.id}
              upgrade={upgrade}
              level={level}
              cores={cores}
              cost={cost}
              onUpgrade={onUpgrade}
              icon={
                <GamePaddleIcon
                  widthRatio={isWidth ? 0.7 + level * 0.12 : 1}
                  size={26}
                  accentColor={upgrade.accentColor}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
};
