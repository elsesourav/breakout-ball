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
  { username: 'sourav', fullName: 'Sourav Elsesourav', stagesCleared: 100, score: 248500, badgeTitle: 'Omega Sovereign' },
  { username: 'speedy_sam', fullName: 'Samantha Speed', stagesCleared: 100, score: 245200, badgeTitle: 'Omega Sovereign' },
  { username: 'arcade_queen', fullName: 'Elena Rostova', stagesCleared: 100, score: 242100, badgeTitle: 'Omega Sovereign' },
  { username: 'cyber_ninja', fullName: 'Kenji Takahashi', stagesCleared: 99, score: 238600, badgeTitle: 'Singularity Legend' },
  { username: 'breakout_pro', fullName: 'Marcus Vance', stagesCleared: 99, score: 235400, badgeTitle: 'Singularity Legend' },
  { username: 'pixel_guy', fullName: 'Leo Martinez', stagesCleared: 98, score: 231800, badgeTitle: 'Singularity Legend' },
  { username: 'neon_striker', fullName: 'Chloe Bennett', stagesCleared: 98, score: 228500, badgeTitle: 'Singularity Legend' },
  { username: 'quantum_ace', fullName: 'Devon Ward', stagesCleared: 97, score: 224900, badgeTitle: 'Singularity Legend' },
  { username: 'hyper_dash', fullName: 'Lucas Thorne', stagesCleared: 97, score: 221400, badgeTitle: 'Singularity Legend' },
  { username: 'retro_pilot', fullName: 'Viktor Novak', stagesCleared: 96, score: 217800, badgeTitle: 'Singularity Legend' },
  { username: 'nova_cadet', fullName: 'Aria Chen', stagesCleared: 95, score: 214200, badgeTitle: 'Hyperion Master' },
  { username: 'laser_runner', fullName: 'Zack Miller', stagesCleared: 94, score: 210800, badgeTitle: 'Hyperion Master' },
  { username: 'solar_flare', fullName: 'Maya Patel', stagesCleared: 94, score: 207500, badgeTitle: 'Hyperion Master' },
  { username: 'void_walker', fullName: 'Dante Cross', stagesCleared: 93, score: 204100, badgeTitle: 'Hyperion Master' },
  { username: 'crypto_striker', fullName: "Finn O'Connor", stagesCleared: 92, score: 200800, badgeTitle: 'Hyperion Master' },
  { username: 'echo_pulse', fullName: 'Sora Tanaka', stagesCleared: 91, score: 197400, badgeTitle: 'Hyperion Master' },
  { username: 'zero_gravity', fullName: 'Aiden Brooks', stagesCleared: 90, score: 194200, badgeTitle: 'Hyperion Master' },
  { username: 'plasma_storm', fullName: 'Garrick Thorne', stagesCleared: 89, score: 190900, badgeTitle: 'Hyperion Master' },
  { username: 'nebula_rider', fullName: 'Talia Reyes', stagesCleared: 89, score: 187600, badgeTitle: 'Hyperion Master' },
  { username: 'omega_cadet', fullName: 'Felix Moreau', stagesCleared: 88, score: 184400, badgeTitle: 'Hyperion Master' },
  { username: 'titan_vanguard', fullName: 'Kaelen Drake', stagesCleared: 87, score: 181200, badgeTitle: 'Void Sentinel' },
  { username: 'blaze_core', fullName: 'Ruby Gallagher', stagesCleared: 86, score: 178000, badgeTitle: 'Void Sentinel' },
  { username: 'shadow_pulse', fullName: 'Zane Mercer', stagesCleared: 85, score: 174900, badgeTitle: 'Void Sentinel' },
  { username: 'flux_runner', fullName: 'Nadia Vos', stagesCleared: 84, score: 171800, badgeTitle: 'Void Sentinel' },
  { username: 'vortex_pilot', fullName: 'Rowan Sterling', stagesCleared: 83, score: 168600, badgeTitle: 'Void Sentinel' },
  { username: 'stellar_hawk', fullName: 'Jaxson Reed', stagesCleared: 82, score: 165500, badgeTitle: 'Void Sentinel' },
  { username: 'glitch_hunter', fullName: 'Kira Jensen', stagesCleared: 81, score: 162400, badgeTitle: 'Void Sentinel' },
  { username: 'byte_striker', fullName: 'Milo Hoffman', stagesCleared: 80, score: 159300, badgeTitle: 'Void Sentinel' },
  { username: 'warp_driver', fullName: 'Selene Ruiz', stagesCleared: 79, score: 156300, badgeTitle: 'Void Sentinel' },
  { username: 'chrono_speeder', fullName: 'Julian Frost', stagesCleared: 78, score: 153200, badgeTitle: 'Void Sentinel' },
  { username: 'drift_master', fullName: 'Rina Sato', stagesCleared: 77, score: 150200, badgeTitle: 'Void Sentinel' },
  { username: 'aero_blade', fullName: 'Darius Vance', stagesCleared: 76, score: 147200, badgeTitle: 'Void Sentinel' },
  { username: 'pulse_forge', fullName: 'Vaughn Miller', stagesCleared: 75, score: 144100, badgeTitle: 'Void Sentinel' },
  { username: 'prism_strike', fullName: 'Lyra Mercer', stagesCleared: 74, score: 141200, badgeTitle: 'Void Sentinel' },
  { username: 'photon_wave', fullName: 'Kiran Rao', stagesCleared: 73, score: 138300, badgeTitle: 'Void Sentinel' },
  { username: 'sonic_rebound', fullName: 'Asher Quinn', stagesCleared: 72, score: 135400, badgeTitle: 'Apex Legend' },
  { username: 'arc_reactor', fullName: 'Brynne Hall', stagesCleared: 70, score: 132500, badgeTitle: 'Apex Legend' },
  { username: 'vector_dash', fullName: 'Cassian Cruz', stagesCleared: 69, score: 129600, badgeTitle: 'Apex Legend' },
  { username: 'zenith_star', fullName: 'Talon Pierce', stagesCleared: 68, score: 126800, badgeTitle: 'Apex Legend' },
  { username: 'cosmo_seeker', fullName: 'Vesper Lin', stagesCleared: 67, score: 124000, badgeTitle: 'Apex Legend' },
  { username: 'hyper_ion', fullName: 'Tobias Blake', stagesCleared: 65, score: 121200, badgeTitle: 'Apex Legend' },
  { username: 'star_glider', fullName: 'Mira Sterling', stagesCleared: 64, score: 118400, badgeTitle: 'Apex Legend' },
  { username: 'orbit_knight', fullName: 'Eamon Walsh', stagesCleared: 63, score: 115700, badgeTitle: 'Apex Legend' },
  { username: 'matrix_cadet', fullName: 'Noemi Frost', stagesCleared: 62, score: 113000, badgeTitle: 'Apex Legend' },
  { username: 'spark_runner', fullName: 'Kellan Zhao', stagesCleared: 60, score: 110400, badgeTitle: 'Apex Legend' },
  { username: 'aegis_core', fullName: 'Damon Vance', stagesCleared: 59, score: 107800, badgeTitle: 'Apex Legend' },
  { username: 'flux_cadet', fullName: 'Isla Thorne', stagesCleared: 58, score: 105200, badgeTitle: 'Apex Legend' },
  { username: 'nano_striker', fullName: 'Cedric Roy', stagesCleared: 57, score: 102600, badgeTitle: 'Apex Legend' },
  { username: 'beacon_prime', fullName: 'Orion Vale', stagesCleared: 56, score: 100100, badgeTitle: 'Apex Legend' },
  { username: 'vanguard_zero', fullName: 'Zephyr Cole', stagesCleared: 55, score: 97600, badgeTitle: 'Apex Legend' },
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
