import React, { useState } from 'react';
import { useGame } from '../context/GameContext';
import {
  Zap,
  Flame,
  Shield,
  Clock,
  Sparkles,
  Layers,
  ChevronUp,
  ShoppingBag,
  Award,
  CircleDot,
  Wrench,
  Gauge,
  Crosshair,
  TrendingUp,
} from 'lucide-react';
import { soundManager } from '../utils/audio';

type ArmoryTab = 'ball' | 'powerups' | 'shop';

interface UpgradeItem {
  id: string;
  name: string;
  category: 'ball' | 'powerups' | 'shop';
  desc: string;
  level: number;
  maxLevel: number;
  currentStat: string;
  nextStat: string;
  cost: number;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
}

export const ArmoryView: React.FC = () => {
  const { user } = useGame();
  const [activeTab, setActiveTab] = useState<ArmoryTab>('ball');
  const [nanoCores, setNanoCores] = useState(1450);

  // Initial mockup upgrade states (ready for future persistence and user customization)
  const [upgrades, setUpgrades] = useState<Record<string, number>>({
    ball_power: 3,
    ball_speed: 2,
    ball_crit: 1,
    laser_duration: 3,
    mega_duration: 2,
    slowmo_duration: 2,
    expand_duration: 4,
    multiball_count: 2,
    shield_charges: 1,
  });

  const handleUpgrade = (id: string, cost: number, maxLevel: number) => {
    const current = upgrades[id] || 1;
    if (current >= maxLevel) return;
    if (nanoCores < cost) return;

    soundManager.play('click');
    setNanoCores((prev) => prev - cost);
    setUpgrades((prev) => ({
      ...prev,
      [id]: (prev[id] || 1) + 1,
    }));
  };

  return (
    <div
      className="w-full h-full overflow-y-auto overflow-x-hidden flex flex-col items-center pt-3.5 pb-28 select-none cyber-grid-bg"
      style={{
        WebkitOverflowScrolling: 'touch',
        color: '#ffffff',
      }}
    >
      {/* 1. Armory Header & Nanocore Balance */}
      <div className="w-full max-w-sm px-3.5 flex flex-col gap-2.5 mb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_12px_#00f7ff]">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <div className="flex flex-col">
              <span
                className="font-display font-black text-sm tracking-wider text-cyan-300 leading-none"
                style={{ color: '#00f7ff', textShadow: '0 0 10px rgba(0, 247, 255, 0.4)' }}
              >
                CYBER ARMORY
              </span>
              <span className="font-tech text-[10px] text-slate-400 tracking-widest mt-0.5">
                KINETIC UPGRADES & WORKSHOP
              </span>
            </div>
          </div>

          {/* Nanocore Currency Badge */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2) 0%, rgba(99, 102, 241, 0.25) 100%)',
              border: '1.5px solid rgba(0, 247, 255, 0.5)',
              boxShadow: '0 0 12px rgba(0, 247, 255, 0.3)',
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-tech font-bold text-xs text-cyan-200">
              {nanoCores.toLocaleString()}
            </span>
            <span className="font-tech text-[9px] text-cyan-400 uppercase tracking-wider font-semibold">
              CORES
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 font-ui leading-normal">
          Upgrade ball kinetic velocity, enhance power-up drop durations, and forge nanotech modifications.
        </p>

        {/* 2. Armory Category Switcher Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090d24]/90 border border-white/10 shadow-md">
          <button
            type="button"
            onClick={() => setActiveTab('ball')}
            style={
              activeTab === 'ball'
                ? {
                    background: 'linear-gradient(135deg, #00f7ff 0%, #0088cc 100%)',
                    color: '#000000',
                    boxShadow: '0 0 12px rgba(0, 247, 255, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg font-tech font-bold text-xs transition-all cursor-pointer"
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>BALL KINETICS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('powerups')}
            style={
              activeTab === 'powerups'
                ? {
                    background: 'linear-gradient(135deg, #b773ff 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    boxShadow: '0 0 12px rgba(183, 115, 255, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg font-tech font-bold text-xs transition-all cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>POWER-UPS</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('shop')}
            style={
              activeTab === 'shop'
                ? {
                    background: 'linear-gradient(135deg, #ffd700 0%, #d97706 100%)',
                    color: '#000000',
                    boxShadow: '0 0 12px rgba(255, 215, 0, 0.4)',
                  }
                : { color: '#94a3b8' }
            }
            className="flex-1 py-1.5 flex items-center justify-center gap-1.5 rounded-lg font-tech font-bold text-xs transition-all cursor-pointer"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>SHOP</span>
          </button>
        </div>
      </div>

      {/* 3. Tab Content */}
      <div className="w-full max-w-sm px-3.5 flex flex-col gap-3">
        {/* TAB 1: BALL KINETICS (Speed, Power, Impact) */}
        {activeTab === 'ball' && (
          <>
            <div className="flex items-center justify-between text-[11px] font-tech text-cyan-400 uppercase tracking-wider px-1">
              <span>CORE STAT MODIFIERS</span>
              <span>SLOTS READY</span>
            </div>

            {/* Ball Strike Power */}
            <ArmoryCard
              name="Kinetic Strike Power"
              desc="Increases damage dealt to reinforced, obsidian, and shielding blocks per collision."
              level={upgrades.ball_power || 3}
              maxLevel={10}
              currentStat={`+${(upgrades.ball_power || 3) * 15}% Hit Power`}
              nextStat={`+${((upgrades.ball_power || 3) + 1) * 15}% Hit Power`}
              cost={(upgrades.ball_power || 3) * 150}
              icon={Zap}
              accentColor="#00f7ff"
              glowColor="rgba(0, 247, 255, 0.35)"
              canAfford={nanoCores >= (upgrades.ball_power || 3) * 150}
              onUpgrade={() => handleUpgrade('ball_power', (upgrades.ball_power || 3) * 150, 10)}
            />

            {/* Ball Velocity Tuning */}
            <ArmoryCard
              name="Overdrive Velocity"
              desc="Boosts base ball acceleration and rebound velocity across the arena playfield."
              level={upgrades.ball_speed || 2}
              maxLevel={10}
              currentStat={`+${(upgrades.ball_speed || 2) * 10}% Velocity`}
              nextStat={`+${((upgrades.ball_speed || 2) + 1) * 10}% Velocity`}
              cost={(upgrades.ball_speed || 2) * 120}
              icon={Gauge}
              accentColor="#38bdf8"
              glowColor="rgba(56, 189, 248, 0.35)"
              canAfford={nanoCores >= (upgrades.ball_speed || 2) * 120}
              onUpgrade={() => handleUpgrade('ball_speed', (upgrades.ball_speed || 2) * 120, 10)}
            />

            {/* Critical Impact Matrix */}
            <ArmoryCard
              name="Critical Blast Matrix"
              desc="Chance to deal 2.5x kinetic shockwave damage and shatter adjacent bricks."
              level={upgrades.ball_crit || 1}
              maxLevel={5}
              currentStat={`${(upgrades.ball_crit || 1) * 5}% Crit Chance`}
              nextStat={`${((upgrades.ball_crit || 1) + 1) * 5}% Crit Chance`}
              cost={(upgrades.ball_crit || 1) * 250}
              icon={Crosshair}
              accentColor="#f43f5e"
              glowColor="rgba(244, 63, 94, 0.35)"
              canAfford={nanoCores >= (upgrades.ball_crit || 1) * 250}
              onUpgrade={() => handleUpgrade('ball_crit', (upgrades.ball_crit || 1) * 250, 5)}
            />
          </>
        )}

        {/* TAB 2: POWER-UPS (Duration and Effect enhancements) */}
        {activeTab === 'powerups' && (
          <>
            <div className="flex items-center justify-between text-[11px] font-tech text-purple-400 uppercase tracking-wider px-1">
              <span>RANDOM DROP AUGMENTATIONS</span>
              <span>TIME & DURATION</span>
            </div>

            {/* Plasma Cannon (Laser) */}
            <ArmoryCard
              name="Plasma Cannon (Laser)"
              desc="Dual laser blasters mounted to paddle that destroy blocks on firing."
              level={upgrades.laser_duration || 3}
              maxLevel={8}
              currentStat={`${(8.0 + (upgrades.laser_duration || 3) * 1.0).toFixed(1)}s Duration`}
              nextStat={`${(8.0 + ((upgrades.laser_duration || 3) + 1) * 1.0).toFixed(1)}s Duration`}
              cost={(upgrades.laser_duration || 3) * 140}
              icon={Flame}
              accentColor="#ff0055"
              glowColor="rgba(255, 0, 85, 0.4)"
              canAfford={nanoCores >= (upgrades.laser_duration || 3) * 140}
              onUpgrade={() => handleUpgrade('laser_duration', (upgrades.laser_duration || 3) * 140, 8)}
            />

            {/* Mega Core (Fireball) */}
            <ArmoryCard
              name="Mega Core (Fireball)"
              desc="Superheated fiery ball that pierces through blocks without bouncing back."
              level={upgrades.mega_duration || 2}
              maxLevel={8}
              currentStat={`${(7.0 + (upgrades.mega_duration || 2) * 1.0).toFixed(1)}s Duration`}
              nextStat={`${(7.0 + ((upgrades.mega_duration || 2) + 1) * 1.0).toFixed(1)}s Duration`}
              cost={(upgrades.mega_duration || 2) * 160}
              icon={Sparkles}
              accentColor="#ffd700"
              glowColor="rgba(255, 215, 0, 0.4)"
              canAfford={nanoCores >= (upgrades.mega_duration || 2) * 160}
              onUpgrade={() => handleUpgrade('mega_duration', (upgrades.mega_duration || 2) * 160, 8)}
            />

            {/* Chronos Warp (Slow-Mo) */}
            <ArmoryCard
              name="Chronos Warp (Slow-Mo)"
              desc="Dilates matrix time physics, granting ultra-precise paddle positioning."
              level={upgrades.slowmo_duration || 2}
              maxLevel={8}
              currentStat={`${(5.5 + (upgrades.slowmo_duration || 2) * 1.0).toFixed(1)}s Duration`}
              nextStat={`${(5.5 + ((upgrades.slowmo_duration || 2) + 1) * 1.0).toFixed(1)}s Duration`}
              cost={(upgrades.slowmo_duration || 2) * 120}
              icon={Clock}
              accentColor="#b773ff"
              glowColor="rgba(183, 115, 255, 0.4)"
              canAfford={nanoCores >= (upgrades.slowmo_duration || 2) * 120}
              onUpgrade={() => handleUpgrade('slowmo_duration', (upgrades.slowmo_duration || 2) * 120, 8)}
            />

            {/* Titan Paddle (Expand) */}
            <ArmoryCard
              name="Titan Paddle (Expand)"
              desc="Enlarges paddle strike width by 50% with reinforced magnetic surface."
              level={upgrades.expand_duration || 4}
              maxLevel={8}
              currentStat={`${(8.0 + (upgrades.expand_duration || 4) * 1.0).toFixed(1)}s Duration`}
              nextStat={`${(8.0 + ((upgrades.expand_duration || 4) + 1) * 1.0).toFixed(1)}s Duration`}
              cost={(upgrades.expand_duration || 4) * 130}
              icon={Layers}
              accentColor="#06b6d4"
              glowColor="rgba(6, 182, 212, 0.4)"
              canAfford={nanoCores >= (upgrades.expand_duration || 4) * 130}
              onUpgrade={() => handleUpgrade('expand_duration', (upgrades.expand_duration || 4) * 130, 8)}
            />

            {/* Multi-Ball Cluster */}
            <ArmoryCard
              name="Multi-Ball Cluster"
              desc="Splits active ball into extra kinetic clones with divergent trajectories."
              level={upgrades.multiball_count || 2}
              maxLevel={5}
              currentStat={`+${(upgrades.multiball_count || 2) + 1} Balls Spawned`}
              nextStat={`+${(upgrades.multiball_count || 2) + 2} Balls Spawned`}
              cost={(upgrades.multiball_count || 2) * 200}
              icon={CircleDot}
              accentColor="#00f7ff"
              glowColor="rgba(0, 247, 255, 0.4)"
              canAfford={nanoCores >= (upgrades.multiball_count || 2) * 200}
              onUpgrade={() => handleUpgrade('multiball_count', (upgrades.multiball_count || 2) * 200, 5)}
            />

            {/* Forcefield Shield */}
            <ArmoryCard
              name="Bottom Forcefield Shield"
              desc="Deploys an emergency laser safety barrier at bottom of arena playfield."
              level={upgrades.shield_charges || 1}
              maxLevel={3}
              currentStat={`${upgrades.shield_charges || 1} Charge per Match`}
              nextStat={`${(upgrades.shield_charges || 1) + 1} Charges per Match`}
              cost={(upgrades.shield_charges || 1) * 300}
              icon={Shield}
              accentColor="#10b981"
              glowColor="rgba(16, 185, 129, 0.4)"
              canAfford={nanoCores >= (upgrades.shield_charges || 1) * 300}
              onUpgrade={() => handleUpgrade('shield_charges', (upgrades.shield_charges || 1) * 300, 3)}
            />
          </>
        )}

        {/* TAB 3: CYBER SHOP */}
        {activeTab === 'shop' && (
          <>
            <div className="flex items-center justify-between text-[11px] font-tech text-amber-400 uppercase tracking-wider px-1">
              <span>SPECIAL NANOTECH PACKS</span>
              <span>ARENA SUPPLIES</span>
            </div>

            {/* Shop Item 1 */}
            <div
              style={{
                backgroundColor: 'rgba(8, 14, 38, 0.95)',
                border: '1.5px solid rgba(255, 215, 0, 0.4)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                borderRadius: '16px',
              }}
              className="p-3.5 flex flex-col gap-2.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 shadow-[0_0_12px_rgba(255,215,0,0.3)]">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-white tracking-wide">
                      Nanocore Vault (+2,500)
                    </h4>
                    <span className="font-tech text-[10px] text-amber-400 font-bold">
                      INSTANT OVERDRIVE CURRENCY
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    soundManager.play('click');
                    setNanoCores((prev) => prev + 2500);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 active:scale-95 transition-all text-black font-tech font-bold text-xs cursor-pointer shadow-[0_0_10px_rgba(255,215,0,0.5)]"
                >
                  CLAIM
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-ui leading-normal">
                Instantly replenish Nanocores to boost your ball kinetic damage and power-up durations.
              </p>
            </div>

            {/* Shop Item 2 */}
            <div
              style={{
                backgroundColor: 'rgba(8, 14, 38, 0.95)',
                border: '1.5px solid rgba(0, 247, 255, 0.3)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.6)',
                borderRadius: '16px',
              }}
              className="p-3.5 flex flex-col gap-2.5 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center text-cyan-300 shadow-[0_0_12px_rgba(0,247,255,0.3)]">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-display font-black text-xs text-white tracking-wide">
                      Arena Multiplier Key (2x)
                    </h4>
                    <span className="font-tech text-[10px] text-cyan-400 font-bold">
                      ACTIVE FOR 24 HOURS
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 font-tech font-bold text-xs opacity-60 cursor-not-allowed"
                >
                  UNLOCKED
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-ui leading-normal">
                Double leaderboard score earnings and community reputation rewards across all arena matches.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

interface ArmoryCardProps {
  name: string;
  desc: string;
  level: number;
  maxLevel: number;
  currentStat: string;
  nextStat: string;
  cost: number;
  icon: React.ElementType;
  accentColor: string;
  glowColor: string;
  canAfford: boolean;
  onUpgrade: () => void;
}

const ArmoryCard: React.FC<ArmoryCardProps> = ({
  name,
  desc,
  level,
  maxLevel,
  currentStat,
  nextStat,
  cost,
  icon: Icon,
  accentColor,
  glowColor,
  canAfford,
  onUpgrade,
}) => {
  const isMax = level >= maxLevel;

  return (
    <div
      style={{
        backgroundColor: 'rgba(8, 14, 38, 0.95)',
        border: `1.5px solid ${accentColor}40`,
        boxShadow: `0 4px 18px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.08)`,
        borderRadius: '16px',
      }}
      className="p-3.5 flex flex-col gap-2.5 relative overflow-hidden transition-all duration-200"
    >
      {/* Top Header Row: Icon + Name + Level Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div
            style={{
              backgroundColor: `${accentColor}18`,
              border: `1.2px solid ${accentColor}60`,
              boxShadow: `0 0 10px ${glowColor}`,
            }}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          >
            <Icon style={{ color: accentColor }} className="w-4 h-4" />
          </div>

          <div className="flex flex-col">
            <h4 className="font-display font-black text-xs text-white tracking-wide">
              {name}
            </h4>
            <span
              style={{ color: accentColor }}
              className="font-tech text-[10px] font-bold"
            >
              {currentStat}
            </span>
          </div>
        </div>

        {/* Level Rank Badge */}
        <span
          style={{
            backgroundColor: isMax ? 'rgba(16, 185, 129, 0.2)' : `${accentColor}15`,
            border: `1px solid ${isMax ? '#10b981' : accentColor}`,
            color: isMax ? '#10b981' : accentColor,
          }}
          className="font-tech text-[10px] font-bold px-2 py-0.5 rounded-full"
        >
          {isMax ? 'MAX RANK' : `LVL ${level}/${maxLevel}`}
        </span>
      </div>

      <p className="text-[11px] text-slate-400 font-ui leading-normal">
        {desc}
      </p>

      {/* Level Progress Segments */}
      <div className="flex items-center gap-1 w-full h-1.5 rounded-full bg-slate-900/80 p-0.5 border border-white/5">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <div
            key={i}
            style={{
              backgroundColor: i < level ? accentColor : 'rgba(255,255,255,0.08)',
              boxShadow: i < level ? `0 0 6px ${glowColor}` : 'none',
            }}
            className="flex-1 h-full rounded-sm transition-all duration-300"
          />
        ))}
      </div>

      {/* Action Footer: Next Stat + Upgrade Button */}
      <div className="flex items-center justify-between pt-1 border-t border-white/10 mt-0.5">
        <div className="flex flex-col">
          <span className="font-tech text-[9px] text-slate-500 uppercase tracking-wider">
            {isMax ? 'STATUS' : 'NEXT RANK'}
          </span>
          <span className="font-tech text-[10px] text-emerald-400 font-bold">
            {isMax ? 'OPTIMAL OVERDRIVE' : nextStat}
          </span>
        </div>

        {/* Upgrade Button */}
        {!isMax ? (
          <button
            type="button"
            disabled={!canAfford}
            onClick={onUpgrade}
            style={{
              backgroundColor: canAfford ? accentColor : 'rgba(255, 255, 255, 0.05)',
              border: `1.5px solid ${canAfford ? accentColor : 'rgba(255, 255, 255, 0.15)'}`,
              color: canAfford ? '#000000' : '#64748b',
              boxShadow: canAfford ? `0 0 12px ${glowColor}` : 'none',
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-tech font-bold text-xs transition-all cursor-pointer active:scale-95 disabled:cursor-not-allowed"
          >
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
            <span>UPGRADE</span>
            <span className="text-[10px] opacity-80">({cost} C)</span>
          </button>
        ) : (
          <span className="text-emerald-400 font-tech font-bold text-xs flex items-center gap-1">
            <Award className="w-3.5 h-3.5" />
            COMPLETED
          </span>
        )}
      </div>
    </div>
  );
};
