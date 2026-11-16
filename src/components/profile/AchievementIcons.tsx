import React from 'react';

export interface AchievementIconProps {
  className?: string;
  style?: React.CSSProperties;
}

/** 1. First Impact: Shattering energy block with radiating shock fragments */
export const IconFirstImpact: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <rect x="5" y="5" width="14" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.15" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 12l2.5 2.5L15 9.5" stroke="#00f7ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="12" r="2" fill="#00f7ff" />
  </svg>
);

/** 2. Combo Spark: Rising twin plasma sparks with multiplier burst */
export const IconComboSpark: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2c1 3.5 4 5 4 9a6 6 0 1 1-12 0c0-3.5 2.5-6.5 4-8 0 2.5 1.5 4 2.5 4s1.5-2.5 1.5-5z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M12 13a2.5 2.5 0 0 0 2-2.5c0-1.5-1-2.5-2-3.5-.8 1-1.5 2-1.5 3a2 2 0 0 0 1.5 3z" fill="#f59e0b" />
    <circle cx="17.5" cy="6.5" r="1.5" fill="#ffd700" />
    <circle cx="6.5" cy="8.5" r="1" fill="#ffd700" />
  </svg>
);

/** 3. Unstoppable Flow: Blistering multi-strike lightning blaze */
export const IconUnstoppableFlow: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M13 2L4 13h6l-2 9 11-12h-7l3-8z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M11 6l-4 7h4l-1 5 6-7h-5l2-5z" fill="#00f7ff" />
    <circle cx="19" cy="5" r="1.5" fill="#a855f7" />
  </svg>
);

/** 4. Quantum Leaper: Dual cyber portals warping space-time */
export const IconQuantumLeaper: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Left Portal */}
    <ellipse cx="6.5" cy="12" rx="3.5" ry="7" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.2" />
    {/* Right Portal */}
    <ellipse cx="17.5" cy="12" rx="3.5" ry="7" stroke="#00f7ff" strokeWidth="1.8" fill="#00f7ff" fillOpacity="0.2" />
    {/* Warp Beam Arc */}
    <path d="M6.5 12c3-4 8-4 11 0" stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" strokeLinecap="round" />
    <circle cx="12" cy="10" r="1.8" fill="#ffffff" />
  </svg>
);

/** 5. Shockwave Master: Detonating EMP core with expanding wave rings */
export const IconShockwaveMaster: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" fill="#00f7ff" stroke="#38bdf8" strokeWidth="1.5" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

/** 6. Supersonic: Mach cone dial and high-speed telemetry needle */
export const IconSupersonic: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 9v4l3 2" stroke="#00f7ff" strokeWidth="2" strokeLinecap="round" />
    <path d="M10 2h4M12 2v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    <path d="M19 6l-2 2M5 6l2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** 7. Sector Veteran: Tiered cybernetic armor shield with double chevrons */
export const IconSectorVeteran: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2L4 5v6c0 5.5 3.5 10 8 11 4.5-1 8-5.5 8-11V5l-8-3z"
      fill="currentColor"
      fillOpacity="0.15"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <path d="M9 10l3 3 3-3M9 14l3 3 3-3" stroke="#00f7ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 8. Apex Legend: Imperial holographic apex crown with orbital gem */
export const IconApexLegend: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3 18h18l-2-11-4.5 5L12 4l-2.5 8L5 7 3 18z"
      fill="currentColor"
      fillOpacity="0.25"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="4" r="1.8" fill="#ffd700" />
    <circle cx="5" cy="7" r="1.2" fill="#ffd700" />
    <circle cx="19" cy="7" r="1.2" fill="#ffd700" />
    <path d="M4 21h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

/** 9. Master Architect: Isometric drafting grid matrix with design cube */
export const IconMasterArchitect: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Isometric Cube */}
    <path d="M12 2l8 4.5v9L12 20l-8-4.5v-9L12 2z" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
    <path d="M12 2v18M12 11l8-4.5M12 11l-8-4.5" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="12" cy="11" r="2.2" fill="#38bdf8" />
  </svg>
);

/** 10. Global Contender: Holographic wireframe digital globe & targeting crosshairs */
export const IconGlobalContender: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" fill="currentColor" fillOpacity="0.1" />
    <ellipse cx="12" cy="12" rx="4" ry="9" stroke="currentColor" strokeWidth="1.4" />
    <path d="M3 12h18M5 7h14M5 17h14" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="12" cy="12" r="2.5" fill="#38bdf8" />
  </svg>
);

/** 11. Photon Striker: Dual tactical laser blasters emitting collinear energy beams */
export const IconPhotonStriker: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Left Blaster Barrel */}
    <rect x="5" y="10" width="3" height="10" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M6.5 2v8" stroke="#00f7ff" strokeWidth="2.5" strokeLinecap="round" />
    {/* Right Blaster Barrel */}
    <rect x="16" y="10" width="3" height="10" rx="1" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1.5" />
    <path d="M17.5 2v8" stroke="#00f7ff" strokeWidth="2.5" strokeLinecap="round" />
    {/* Target Crosshair between */}
    <circle cx="12" cy="5" r="2" stroke="#ffd700" strokeWidth="1.2" />
  </svg>
);

/** 12. Overclocked Swarm: Tri-ball energetic constellation orbiting in triangle */
export const IconOverclockedSwarm: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Orbit lines connecting the 3 balls */}
    <path d="M12 4.5L5.5 17.5h13L12 4.5z" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.5 2" opacity="0.6" />
    {/* Top Ball */}
    <circle cx="12" cy="4.5" r="3" fill="#00f7ff" stroke="#ffffff" strokeWidth="1.5" />
    {/* Bottom Left Ball */}
    <circle cx="5.5" cy="17.5" r="3" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
    {/* Bottom Right Ball */}
    <circle cx="18.5" cy="17.5" r="3" fill="#fbbf24" stroke="#ffffff" strokeWidth="1.5" />
    {/* Center Plasma Nucleus */}
    <circle cx="12" cy="13" r="1.5" fill="#ffffff" />
  </svg>
);

/** 13. Aegis Sentinel: Hexagonal safety forcefield barrier deflecting ball upward */
export const IconAegisSentinel: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Bottom Barrier Platform */}
    <rect x="3" y="18" width="18" height="3" rx="1.5" fill="currentColor" stroke="currentColor" strokeWidth="1.2" />
    {/* Radiant Forcefield Arc */}
    <path d="M4 16c4-4 12-4 16 0" stroke="#00f7ff" strokeWidth="2.2" strokeLinecap="round" />
    {/* Bouncing Energy Ball with Deflection Trail */}
    <circle cx="12" cy="9" r="3" fill="#00f7ff" stroke="#ffffff" strokeWidth="1.5" />
    <path d="M12 15v-3M9.5 11l2.5-2 2.5 2" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** 14. Titan Breaker: Shattered Cyber Boss Core breached by energy spike */
export const IconTitanBreaker: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Outer Boss Core Octagon */}
    <path
      d="M7 3h10l5 5v8l-5 5H7l-5-5V8l5-5z"
      fill="currentColor"
      fillOpacity="0.2"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
    />
    {/* Cleaving Energy Spike */}
    <path d="M12 2l-2 9h4l-2 11" stroke="#e11d48" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Shatter Fracture Lines */}
    <path d="M6 10l4 2M14 12l4-2M8 16l3-1M13 15l3 1" stroke="#fb7185" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** 15. Celestial Ace: Radiant constellation of three golden stars in crest */
export const IconCelestialAce: React.FC<AchievementIconProps> = ({ className = 'w-5 h-5', style }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} style={style} xmlns="http://www.w3.org/2000/svg">
    {/* Outer Diamond Crest */}
    <path d="M12 2l8 10-8 10-8-10 8-10z" stroke="currentColor" strokeWidth="1.6" fill="currentColor" fillOpacity="0.1" />
    {/* Big Center Star */}
    <path d="M12 7l1.5 3 3.5.5-2.5 2.5.5 3.5-3-1.5-3 1.5.5-3.5-2.5-2.5 3.5-.5L12 7z" fill="#ffd700" stroke="#f59e0b" strokeWidth="1" />
    {/* Left Flank Star */}
    <circle cx="6.5" cy="12" r="1.5" fill="#fef08a" />
    {/* Right Flank Star */}
    <circle cx="17.5" cy="12" r="1.5" fill="#fef08a" />
  </svg>
);

/** Custom Cyberpunk Achievement Icon Registry Map */
export const ACHIEVEMENT_CUSTOM_ICONS: Record<string, React.FC<AchievementIconProps>> = {
  first_blood: IconFirstImpact,
  combo_5: IconComboSpark,
  combo_10: IconUnstoppableFlow,
  portal_hopper: IconQuantumLeaper,
  emp_detonator: IconShockwaveMaster,
  speed_demon: IconSupersonic,
  campaign_10: IconSectorVeteran,
  apex_champion: IconApexLegend,
  level_architect: IconMasterArchitect,
  arena_challenger: IconGlobalContender,
  laser_barrage: IconPhotonStriker,
  multiball_chaos: IconOverclockedSwarm,
  shield_saviour: IconAegisSentinel,
  boss_slayer: IconTitanBreaker,
  celestial_ace: IconCelestialAce,
};
