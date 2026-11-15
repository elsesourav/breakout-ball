import React, { useState, useEffect, useRef } from 'react';
import {
  getActiveDesignConfig,
  setActiveDesignConfig,
  resetDesignConfigToCodeDefault,
  DesignPresetConfig,
  BlockPresetId,
  PaddlePresetId,
  PowerUpPresetId,
  BallPresetId,
  PaddleTier,
  BallTier,
  BLOCK_PRESET_METADATA,
  PADDLE_PRESET_METADATA,
  BALL_PRESET_METADATA,
  POWERUP_PRESET_METADATA,
} from '../constants/visualPresets';
import { drawBlockWithPreset } from '../engine/draw/blockDrawers';
import { drawPaddleWithPreset } from '../engine/draw/paddleDrawers';
import { drawPowerUpWithPreset } from '../engine/draw/powerUpDrawers';
import { drawBallWithPreset } from '../engine/draw/ballDrawers';
import { BlockEngineState, PaddleState } from '../engine/types';
import { POWER_UP_CONFIGS, PowerUpDrop, PowerUpType } from '../engine/powerUpTypes';
import { ChevronLeft, Check, RefreshCw, Zap, Crosshair } from 'lucide-react';

interface VisualDesignLabProps {
  onBack?: () => void;
}

const BALL_PALETTES = [
  { id: 'cyan', label: 'CYAN', glow: '#00f7ff', c1: '#ffffff', c2: '#7df9ff', c3: '#0055ff' },
  { id: 'fire', label: 'FIRE', glow: '#ff5500', c1: '#ffffff', c2: '#ff9900', c3: '#ff0055' },
  { id: 'void', label: 'VOID', glow: '#c084fc', c1: '#ffffff', c2: '#e879f9', c3: '#7c3aed' },
  { id: 'matrix', label: 'MATRIX', glow: '#10b981', c1: '#ffffff', c2: '#6ee7b7', c3: '#059669' },
  { id: 'gold', label: 'GOLD', glow: '#ffd700', c1: '#ffffff', c2: '#fef08a', c3: '#eab308' },
];

export const VisualDesignLab: React.FC<VisualDesignLabProps> = ({ onBack }) => {
  const [config, setConfig] = useState<DesignPresetConfig>(getActiveDesignConfig());
  const [activeTab, setActiveTab] = useState<'blocks' | 'paddles' | 'balls' | 'powerups'>('blocks');

  // Animation frame tick
  const [animTick, setAnimTick] = useState(0);

  // Block hit animations
  const [blockHitAnims, setBlockHitAnims] = useState<Record<string, number>>({});

  // Paddle controls
  const [paddleWidthScale, setPaddleWidthScale] = useState(1.0);
  const [hasLaser, setHasLaser] = useState(true);
  const [paddleTier, setPaddleTier] = useState<PaddleTier>(2);

  // Ball controls
  const [ballTier, setBallTier] = useState<BallTier>(2);
  const [selectedPaletteIndex, setSelectedPaletteIndex] = useState(0);
  const [isMegaBall, setIsMegaBall] = useState(false);

  // PowerUp scale
  const [powerUpScale, setPowerUpScale] = useState(config.powerUpScale || 1.35);

  useEffect(() => {
    let frameId: number;
    let t = 0;
    const loop = () => {
      t += 0.04;
      setAnimTick(t);

      setBlockHitAnims((prev) => {
        let changed = false;
        const next: Record<string, number> = {};
        for (const k in prev) {
          if (prev[k] > 0.05) {
            next[k] = prev[k] * 0.85;
            changed = true;
          }
        }
        return changed ? next : prev;
      });

      frameId = requestAnimationFrame(loop);
    };
    frameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frameId);
  }, []);

  const handleApplyPreset = (updates: Partial<DesignPresetConfig>) => {
    const updated = setActiveDesignConfig(updates);
    setConfig(updated);
  };

  const handleResetDefaults = () => {
    const def = resetDesignConfigToCodeDefault();
    setConfig(def);
    setPowerUpScale(def.powerUpScale);
  };

  const handleHitBlock = (key: string) => {
    setBlockHitAnims((prev) => ({ ...prev, [key]: 1.0 }));
  };

  return (
    <div className="relative w-full h-full bg-[#030612] text-slate-100 flex flex-col overflow-hidden select-none">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <header className="flex-none px-4 py-2.5 bg-[#070b1e]/90 border-b border-cyan-500/25 flex items-center justify-between backdrop-blur-md z-30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer border border-slate-700/60"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="font-display font-black text-sm tracking-wider text-cyan-400">
              DESIGN LAB
            </span>
            <span className="text-xs text-slate-500 font-mono">//</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold">
              VERSION FORGE
            </span>
          </div>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-[11px] font-mono text-slate-300 hover:text-white border border-slate-700/50 cursor-pointer active:scale-95 transition-all"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>RESET DEFAULTS</span>
        </button>
      </header>

      {/* ── Tabs (Simple & Clean) ──────────────────────────────────────────── */}
      <nav className="flex-none px-3 py-2 bg-[#040817] border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto scrollbar-none z-20">
        {[
          { id: 'blocks', label: '🧱 BLOCKS' },
          { id: 'paddles', label: '🏓 PADDLES' },
          { id: 'balls', label: '🔮 BALLS (3D)' },
          { id: 'powerups', label: '⚡ POWER-UPS' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-cyan-600/30 to-blue-600/30 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(0,247,255,0.25)]'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ── Content View ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {/* =================================================================== */}
        {/* TAB 1: BLOCKS                                                       */}
        {/* =================================================================== */}
        {activeTab === 'blocks' && (
          <section className="space-y-4 max-w-5xl mx-auto">
            {([1, 2, 3] as BlockPresetId[]).map((vId) => {
              const meta = BLOCK_PRESET_METADATA[vId];
              const isCurrent = config.blockPreset === vId;

              return (
                <div
                  key={`block-version-${vId}`}
                  className={`rounded-2xl p-4 transition-all border ${
                    isCurrent
                      ? 'bg-[#060c24]/90 border-cyan-400/50 shadow-[0_0_24px_rgba(0,247,255,0.15)]'
                      : 'bg-[#060919]/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-white tracking-wider">
                        {meta.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        {meta.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyPreset({ blockPreset: vId })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,247,255,0.6)] cursor-default'
                          : 'bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-200 border border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <span>SELECT FOR GAME</span>
                      )}
                    </button>
                  </div>

                  {/* 8 Block Types Grid */}
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((health) => {
                      const key = `b-${vId}-${health}`;
                      const hitAnim = blockHitAnims[key] || 0;
                      const label =
                        health <= 5 ? `HP ${health}` : health === 6 ? 'TITANIUM' : health === 7 ? 'PORTAL' : 'EMP';

                      return (
                        <div
                          key={key}
                          onClick={() => handleHitBlock(key)}
                          className="flex flex-col items-center p-2 rounded-xl bg-[#02040c] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer active:scale-95 transition-all"
                        >
                          <span className="text-[9px] font-mono font-bold text-slate-400 mb-1">{label}</span>
                          <SingleBlockCanvas
                            health={health}
                            initialHealth={health}
                            hitAnim={hitAnim}
                            preset={vId}
                            animTick={animTick}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PADDLES                                                      */}
        {/* =================================================================== */}
        {activeTab === 'paddles' && (
          <section className="space-y-4 max-w-5xl mx-auto">
            {/* Minimal Controls Bar */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 font-bold px-2">TIER:</span>
                {([1, 2, 3] as PaddleTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setPaddleTier(t);
                      handleApplyPreset({ paddleTierOverride: t });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      paddleTier === t
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                    }`}
                  >
                    TIER {t}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setHasLaser((v) => !v)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    hasLaser
                      ? 'bg-rose-950/80 border-rose-500/60 text-rose-300'
                      : 'bg-slate-900/80 border-slate-700 text-slate-500'
                  }`}
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>LASER: {hasLaser ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  onClick={() => setPaddleWidthScale((w) => (w === 1.0 ? 1.35 : 1.0))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    paddleWidthScale > 1.0
                      ? 'bg-cyan-950/80 border-cyan-500/60 text-cyan-300'
                      : 'bg-slate-900/80 border-slate-700 text-slate-500'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>EXPAND: {paddleWidthScale > 1.0 ? '1.35x' : '1.0x'}</span>
                </button>
              </div>
            </div>

            {/* Selected Mech Titan Dreadnought Showcase */}
            <div className="rounded-2xl p-4 bg-[#060c24]/90 border border-blue-400/50 shadow-[0_0_24px_rgba(59,130,246,0.15)]">
              <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="font-display font-black text-sm text-white tracking-wider">
                    MECH TITAN DREADNOUGHT
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-950/60 text-blue-300 border border-blue-800/40">
                    SELECTED (ACTIVE IN GAME)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold bg-blue-500 text-slate-950 shadow-[0_0_12px_rgba(59,130,246,0.6)]">
                  <Check className="w-3.5 h-3.5" />
                  <span>ACTIVE</span>
                </div>
              </div>

              {/* Live Canvas for this Paddle */}
              <div className="bg-[#02040c] rounded-xl border border-slate-800/80 p-4 flex items-center justify-center">
                <SinglePaddleCanvas
                  preset={1}
                  animTick={animTick}
                  widthScale={paddleWidthScale}
                  hasLaser={hasLaser}
                  tier={paddleTier}
                />
              </div>

              {/* 3 Tiers Preview side by side */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800/60">
                {([1, 2, 3] as PaddleTier[]).map((t) => (
                  <button
                    key={`p-tier-btn-${t}`}
                    onClick={() => {
                      setPaddleTier(t);
                      handleApplyPreset({ paddleTierOverride: t });
                    }}
                    className={`p-2 rounded-xl text-left border cursor-pointer transition-all ${
                      paddleTier === t
                        ? 'bg-blue-950/40 border-blue-400 text-blue-300'
                        : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-[11px] font-mono font-bold">
                      TIER {t} {t === 1 ? '(BASE)' : t === 2 ? '(REINFORCED)' : '(APEX)'}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 3: BALLS (3D Internal Core & Upgrades)                           */}
        {/* =================================================================== */}
        {activeTab === 'balls' && (
          <section className="space-y-4 max-w-5xl mx-auto">
            {/* Minimal Controls Bar */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
              {/* Ball Tier Selector */}
              <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 font-bold px-2">BALL UPGRADE:</span>
                {([1, 2, 3] as BallTier[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setBallTier(t);
                      handleApplyPreset({ ballTierOverride: t });
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      ballTier === t
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/60 shadow-[0_0_8px_rgba(0,247,255,0.25)]'
                        : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/40'
                    }`}
                  >
                    TIER {t}
                  </button>
                ))}
              </div>

              {/* Color Palette Selector */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                  {BALL_PALETTES.map((pal, idx) => (
                    <button
                      key={pal.id}
                      onClick={() => setSelectedPaletteIndex(idx)}
                      className={`w-5 h-5 rounded-full cursor-pointer transition-all border ${
                        selectedPaletteIndex === idx
                          ? 'border-white scale-110 shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: pal.glow }}
                      title={pal.label}
                    />
                  ))}
                </div>

                <button
                  onClick={() => setIsMegaBall((v) => !v)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all border cursor-pointer ${
                    isMegaBall
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.3)]'
                      : 'bg-slate-900 border-slate-700 text-slate-400'
                  }`}
                >
                  MEGA: {isMegaBall ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* 3 Ball Versions */}
            {([1, 2, 3] as BallPresetId[]).map((vId) => {
              const meta = BALL_PRESET_METADATA[vId];
              const isCurrent = config.ballPreset === vId;
              const activePalette = BALL_PALETTES[selectedPaletteIndex];

              return (
                <div
                  key={`ball-version-${vId}`}
                  className={`rounded-2xl p-4 transition-all border ${
                    isCurrent
                      ? 'bg-[#060c24]/90 border-cyan-400/50 shadow-[0_0_24px_rgba(0,247,255,0.15)]'
                      : 'bg-[#060919]/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-white tracking-wider">
                        {meta.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/40">
                        {meta.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyPreset({ ballPreset: vId })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-cyan-400 text-slate-950 shadow-[0_0_12px_rgba(0,247,255,0.6)] cursor-default'
                          : 'bg-slate-800 hover:bg-cyan-600/30 text-slate-300 hover:text-cyan-200 border border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <span>SELECT FOR GAME</span>
                      )}
                    </button>
                  </div>

                  {/* 3 Tiers side-by-side for this Ball Version */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([1, 2, 3] as BallTier[]).map((tierNum) => (
                      <div
                        key={`b-${vId}-t-${tierNum}`}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border ${
                          ballTier === tierNum
                            ? 'bg-[#04081c] border-cyan-500/40 shadow-[0_0_12px_rgba(0,247,255,0.1)]'
                            : 'bg-[#02040c] border-slate-800/80'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-bold text-slate-400 mb-2">
                          TIER {tierNum} {tierNum === 1 ? '(BASE)' : tierNum === 2 ? '(FUSION)' : '(APEX)'}
                        </span>
                        <SingleBallCanvas
                          preset={vId}
                          tier={tierNum}
                          palette={activePalette}
                          isMega={isMegaBall}
                          animTick={animTick}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        )}

        {/* =================================================================== */}
        {/* TAB 4: POWER-UPS                                                    */}
        {/* =================================================================== */}
        {activeTab === 'powerups' && (
          <section className="space-y-4 max-w-5xl mx-auto">
            {/* Minimal Size Control */}
            <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-4">
              <span className="text-xs font-mono font-bold text-slate-300">SIZE MULTIPLIER:</span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="1.0"
                  max="1.7"
                  step="0.05"
                  value={powerUpScale}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPowerUpScale(val);
                    handleApplyPreset({ powerUpScale: val });
                  }}
                  className="w-32 accent-amber-400 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold text-amber-300 w-10">
                  {powerUpScale.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* 3 Power-Up Versions */}
            {([1, 2, 3] as PowerUpPresetId[]).map((vId) => {
              const meta = POWERUP_PRESET_METADATA[vId];
              const isCurrent = config.powerUpPreset === vId;

              return (
                <div
                  key={`powerup-version-${vId}`}
                  className={`rounded-2xl p-4 transition-all border ${
                    isCurrent
                      ? 'bg-[#060c24]/90 border-amber-400/50 shadow-[0_0_24px_rgba(251,191,36,0.15)]'
                      : 'bg-[#060919]/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-3 border-b border-slate-800 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-black text-sm text-white tracking-wider">
                        {meta.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/40">
                        {meta.tag}
                      </span>
                    </div>

                    <button
                      onClick={() => handleApplyPreset({ powerUpPreset: vId })}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] cursor-default'
                          : 'bg-slate-800 hover:bg-amber-600/30 text-slate-300 hover:text-amber-200 border border-slate-700'
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>ACTIVE</span>
                        </>
                      ) : (
                        <span>SELECT FOR GAME</span>
                      )}
                    </button>
                  </div>

                  {/* 6 Power-Up Types Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {(
                      [
                        'multiball',
                        'megaball',
                        'laser',
                        'slowmo',
                        'shield',
                        'expand',
                      ] as PowerUpType[]
                    ).map((type) => {
                      const cfg = POWER_UP_CONFIGS[type];
                      const label = cfg ? cfg.label : type.toUpperCase();
                      return (
                        <div
                          key={`p-${vId}-${type}`}
                          className="flex flex-col items-center p-2 rounded-xl bg-[#02040c] border border-slate-800/80 hover:border-amber-500/40 transition-all"
                        >
                          <span className="text-[9px] font-mono font-bold text-slate-400 mb-1">
                            {label}
                          </span>
                          <SinglePowerUpCanvas
                            type={type}
                            preset={vId}
                            scale={powerUpScale}
                            animTick={animTick}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COMPACT CANVAS SUBCOMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
function SingleBlockCanvas({
  health,
  initialHealth,
  hitAnim,
  preset,
  animTick,
}: {
  health: number;
  initialHealth: number;
  hitAnim: number;
  preset: BlockPresetId;
  animTick: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const block: BlockEngineState = {
      index: 0,
      col: 0,
      row: 0,
      x: 0,
      y: 0,
      w: canvas.width,
      h: canvas.height,
      health,
      initialHealth,
      isDead: false,
      hitAnim,
      counter: 3,
    };

    drawBlockWithPreset(ctx, block, preset, { animTick });
  }, [health, initialHealth, hitAnim, preset, animTick]);

  return <canvas ref={canvasRef} width={88} height={52} className="rounded-lg shadow-md" />;
}

function SinglePaddleCanvas({
  preset,
  animTick,
  widthScale,
  hasLaser,
  tier = 1,
}: {
  preset: PaddlePresetId;
  animTick: number;
  widthScale: number;
  hasLaser: boolean;
  tier?: PaddleTier;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pw = 280 * widthScale;
    const ph = 42;
    const paddle: PaddleState = {
      x: canvas.width / 2,
      y: (canvas.height - ph) / 2 - 4,
      width: pw,
      height: ph,
      targetX: canvas.width / 2,
      vx: 0,
    };

    drawPaddleWithPreset(ctx, paddle, preset, { animTick, hasLaser, hasShield: true, tier });
  }, [preset, animTick, widthScale, hasLaser, tier]);

  return <canvas ref={canvasRef} width={440} height={80} className="w-full max-w-[440px] h-auto" />;
}

function SingleBallCanvas({
  preset,
  tier,
  palette,
  isMega,
  animTick,
}: {
  preset: BallPresetId;
  tier: BallTier;
  palette: { glow: string; c1: string; c2: string; c3: string };
  isMega: boolean;
  animTick: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const radius = 24;
    const ball = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius,
      isMega,
    };

    drawBallWithPreset(ctx, ball, preset, { animTick, tier, palette, isMega });
  }, [preset, tier, palette, isMega, animTick]);

  return <canvas ref={canvasRef} width={80} height={80} className="rounded-full shadow-lg" />;
}

function SinglePowerUpCanvas({
  type,
  preset,
  scale,
  animTick,
}: {
  type: PowerUpType;
  preset: PowerUpPresetId;
  scale: number;
  animTick: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const drop: PowerUpDrop = {
      id: 1,
      x: canvas.width / 2,
      y: canvas.height / 2,
      vy: 0,
      meta: POWER_UP_CONFIGS[type],
      collected: false,
      angle: animTick,
    };

    drawPowerUpWithPreset(ctx, drop, preset, { animTick, scale });
  }, [type, preset, scale, animTick]);

  return <canvas ref={canvasRef} width={100} height={100} className="rounded-lg shadow-sm" />;
}
