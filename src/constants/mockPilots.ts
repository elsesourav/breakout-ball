// Offline fallback pilot profiles in case backend API and Firestore are both offline
export interface MockPilot {
  username: string;
  fullName?: string;
  coresCleared?: number;
  stagesCleared: number;
  score: number;
  badgeTitle: string;
  avatarUrl?: string;
}

export const formatPilotDisplayName = (username: string, fullName?: string): string => {
  if (fullName && fullName.trim() && fullName.trim().toLowerCase() !== username.toLowerCase()) {
    return fullName.trim();
  }
  return username
    .split(/[._-]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
};

export const getPilotAvatarUrl = (username: string, avatarUrl?: string, index: number = 0): string => {
  if (avatarUrl && avatarUrl.trim()) return avatarUrl.trim();
  const styles = ['bottts', 'pixel-art', 'bottts', 'identicon', 'pixel-art'];
  const style = styles[index % styles.length];
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(username)}&size=64`;
};

export const FALLBACK_GLOBAL_PILOTS: MockPilot[] = [
  { username: 'sourav', fullName: 'Sourav Elsesourav', stagesCleared: 50, score: 388500, badgeTitle: 'Apex Legend' },
  { username: 'speedy_sam', fullName: 'Samantha Speed', stagesCleared: 50, score: 381200, badgeTitle: 'Apex Legend' },
  { username: 'arcade_queen', fullName: 'Elena Rostova', stagesCleared: 50, score: 375400, badgeTitle: 'Apex Legend' },
  { username: 'cyber_ninja', fullName: 'Kenji Takahashi', stagesCleared: 49, score: 367800, badgeTitle: 'Void Master' },
  { username: 'breakout_pro', fullName: 'Marcus Vance', stagesCleared: 49, score: 359600, badgeTitle: 'Void Master' },
  { username: 'pixel_guy', fullName: 'Leo Martinez', stagesCleared: 48, score: 351200, badgeTitle: 'Void Master' },
  { username: 'neon_striker', fullName: 'Chloe Bennett', stagesCleared: 48, score: 343900, badgeTitle: 'Void Master' },
  { username: 'quantum_ace', fullName: 'Devon Ward', stagesCleared: 47, score: 336500, badgeTitle: 'Void Master' },
  { username: 'hyper_dash', fullName: 'Lucas Thorne', stagesCleared: 47, score: 329100, badgeTitle: 'Void Master' },
  { username: 'retro_pilot', fullName: 'Viktor Novak', stagesCleared: 46, score: 321800, badgeTitle: 'Void Master' },
  { username: 'nova_cadet', fullName: 'Aria Chen', stagesCleared: 45, score: 314400, badgeTitle: 'Void Master' },
  { username: 'laser_runner', fullName: 'Zack Miller', stagesCleared: 45, score: 307200, badgeTitle: 'Void Master' },
  { username: 'solar_flare', fullName: 'Maya Patel', stagesCleared: 44, score: 299800, badgeTitle: 'Solar Vanguard' },
  { username: 'void_walker', fullName: 'Dante Cross', stagesCleared: 44, score: 292500, badgeTitle: 'Abyssal Nomad' },
  { username: 'crypto_striker', fullName: "Finn O'Connor", stagesCleared: 43, score: 285400, badgeTitle: 'Cipher Specialist' },
  { username: 'echo_pulse', fullName: 'Sora Tanaka', stagesCleared: 43, score: 278600, badgeTitle: 'Resonance Pilot' },
  { username: 'zero_gravity', fullName: 'Aiden Brooks', stagesCleared: 42, score: 271500, badgeTitle: 'Float Specialist' },
  { username: 'plasma_storm', fullName: 'Garrick Thorne', stagesCleared: 41, score: 264200, badgeTitle: 'Ion Disruptor' },
  { username: 'nebula_rider', fullName: 'Talia Reyes', stagesCleared: 41, score: 257400, badgeTitle: 'Starlight Drifter' },
  { username: 'omega_cadet', fullName: 'Felix Moreau', stagesCleared: 40, score: 250100, badgeTitle: 'Sector Sentinel' },
  { username: 'titan_vanguard', fullName: 'Kaelen Drake', stagesCleared: 39, score: 242800, badgeTitle: 'Heavy Sentinel' },
  { username: 'blaze_core', fullName: 'Ruby Gallagher', stagesCleared: 38, score: 235600, badgeTitle: 'Inferno Pilot' },
  { username: 'shadow_pulse', fullName: 'Zane Mercer', stagesCleared: 38, score: 228900, badgeTitle: 'Stealth Breaker' },
  { username: 'flux_runner', fullName: 'Nadia Vos', stagesCleared: 37, score: 221500, badgeTitle: 'Kinetic Courier' },
  { username: 'vortex_pilot', fullName: 'Rowan Sterling', stagesCleared: 36, score: 214600, badgeTitle: 'Graviton Striker' },
  { username: 'stellar_hawk', fullName: 'Jaxson Reed', stagesCleared: 35, score: 207400, badgeTitle: 'Celestial Scout' },
  { username: 'glitch_hunter', fullName: 'Kira Jensen', stagesCleared: 35, score: 200500, badgeTitle: 'Bug Detonator' },
  { username: 'byte_striker', fullName: 'Milo Hoffman', stagesCleared: 34, score: 193800, badgeTitle: 'Data Striker' },
  { username: 'warp_driver', fullName: 'Selene Ruiz', stagesCleared: 33, score: 187200, badgeTitle: 'Tesseract Pilot' },
  { username: 'chrono_speeder', fullName: 'Julian Frost', stagesCleared: 32, score: 180400, badgeTitle: 'Time Manipulator' },
  { username: 'drift_master', fullName: 'Rina Sato', stagesCleared: 31, score: 173900, badgeTitle: 'Apex Slider' },
  { username: 'aero_blade', fullName: 'Darius Vance', stagesCleared: 30, score: 167200, badgeTitle: 'Edge Runner' },
  { username: 'pulse_forge', fullName: 'Vaughn Miller', stagesCleared: 29, score: 160800, badgeTitle: 'Alloy Smith' },
  { username: 'prism_strike', fullName: 'Lyra Mercer', stagesCleared: 28, score: 154500, badgeTitle: 'Refractor Ace' },
  { username: 'photon_wave', fullName: 'Kiran Rao', stagesCleared: 27, score: 148100, badgeTitle: 'Laser Cadet' },
  { username: 'sonic_rebound', fullName: 'Asher Quinn', stagesCleared: 26, score: 141900, badgeTitle: 'Acoustic Breaker' },
  { username: 'arc_reactor', fullName: 'Brynne Hall', stagesCleared: 25, score: 135600, badgeTitle: 'Tesla Gunner' },
  { username: 'vector_dash', fullName: 'Cassian Cruz', stagesCleared: 24, score: 129400, badgeTitle: 'Vector Cadet' },
  { username: 'zenith_star', fullName: 'Talon Pierce', stagesCleared: 23, score: 123200, badgeTitle: 'Apex Star' },
  { username: 'cosmo_seeker', fullName: 'Vesper Lin', stagesCleared: 22, score: 117100, badgeTitle: 'Deep Space Scout' },
  { username: 'hyper_ion', fullName: 'Tobias Blake', stagesCleared: 21, score: 111200, badgeTitle: 'Charge Master' },
  { username: 'star_glider', fullName: 'Mira Sterling', stagesCleared: 20, score: 105400, badgeTitle: 'Orbital Glider' },
  { username: 'orbit_knight', fullName: 'Eamon Walsh', stagesCleared: 19, score: 99600, badgeTitle: 'Defense Core' },
  { username: 'matrix_cadet', fullName: 'Noemi Frost', stagesCleared: 18, score: 93900, badgeTitle: 'Grid Runner' },
  { username: 'spark_runner', fullName: 'Kellan Zhao', stagesCleared: 17, score: 88200, badgeTitle: 'Volt Sprinter' },
  { username: 'aegis_core', fullName: 'Damon Vance', stagesCleared: 16, score: 82600, badgeTitle: 'Shield Bearer' },
  { username: 'flux_cadet', fullName: 'Isla Thorne', stagesCleared: 15, score: 77100, badgeTitle: 'Pulse Trainee' },
  { username: 'nano_striker', fullName: 'Cedric Roy', stagesCleared: 15, score: 71500, badgeTitle: 'Micro Breaker' },
  { username: 'beacon_prime', fullName: 'Orion Vale', stagesCleared: 14, score: 66200, badgeTitle: 'Beacon Sentinel' },
  { username: 'vanguard_zero', fullName: 'Zephyr Cole', stagesCleared: 14, score: 61000, badgeTitle: 'Origin Pioneer' },
];

export const FALLBACK_WEEKLY_PILOTS: MockPilot[] = [
  { username: 'speedy_sam', fullName: 'Samantha Speed', stagesCleared: 14, score: 98500, badgeTitle: 'Weekly Ace' },
  { username: 'sourav', fullName: 'Sourav Elsesourav', stagesCleared: 13, score: 92200, badgeTitle: 'Weekly Legend' },
  { username: 'cyber_ninja', fullName: 'Kenji Takahashi', stagesCleared: 12, score: 85400, badgeTitle: 'Weekly Champion' },
  { username: 'arcade_queen', fullName: 'Elena Rostova', stagesCleared: 12, score: 82200, badgeTitle: 'Challenger' },
  { username: 'breakout_pro', fullName: 'Marcus Vance', stagesCleared: 11, score: 75100, badgeTitle: 'Core Striker' },
  { username: 'neon_striker', fullName: 'Chloe Bennett', stagesCleared: 10, score: 71400, badgeTitle: 'Rookie' },
  { username: 'quantum_ace', fullName: 'Devon Ward', stagesCleared: 9, score: 64500, badgeTitle: 'Weekly Scout' },
  { username: 'hyper_dash', fullName: 'Lucas Thorne', stagesCleared: 9, score: 61800, badgeTitle: 'Weekly Cadet' },
  { username: 'retro_pilot', fullName: 'Viktor Novak', stagesCleared: 8, score: 55100, badgeTitle: 'Sector Runner' },
  { username: 'nova_cadet', fullName: 'Aria Chen', stagesCleared: 8, score: 51800, badgeTitle: 'Recruit' },
  { username: 'laser_runner', fullName: 'Zack Miller', stagesCleared: 7, score: 46200, badgeTitle: 'Trainee' },
  { username: 'solar_flare', fullName: 'Maya Patel', stagesCleared: 7, score: 43800, badgeTitle: 'Novice' },
  { username: 'void_walker', fullName: 'Dante Cross', stagesCleared: 6, score: 38500, badgeTitle: 'Scout' },
  { username: 'crypto_striker', fullName: "Finn O'Connor", stagesCleared: 6, score: 35200, badgeTitle: 'Scout' },
  { username: 'echo_pulse', fullName: 'Sora Tanaka', stagesCleared: 5, score: 32100, badgeTitle: 'Cadet' },
];
