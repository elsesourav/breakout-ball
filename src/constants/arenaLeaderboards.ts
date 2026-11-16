import { LeaderboardEntry } from '../types/game';

/**
 * Curated Demo Registered Pilots for Top Arena Stages
 *
 * Completion times are tuned to realistic human playthrough speeds (40s - 105s),
 * allowing any dedicated player who practices to beat the top time,
 * rise rapidly to Rank #1, and see their personal record claim the top leaderboard spot!
 */
export const ARENA_TOP_LEADERBOARDS: Record<string, LeaderboardEntry[]> = {
  // 1. CHAMP: Apex Arena (Flagship Arena Level - 10 Registered Demo Players)
  CHAMP: [
    { rank: 1, username: 'cyber_ninja', displayName: 'Kenji Takahashi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_ninja&size=64', time: 43.8, score: 9420 },
    { rank: 2, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 47.2, score: 9180 },
    { rank: 3, username: 'hyper_dash', displayName: 'Lucas Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hyper_dash&size=64', time: 51.5, score: 8850 },
    { rank: 4, username: 'neon_striker', displayName: 'Chloe Bennett', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=neon_striker&size=64', time: 56.1, score: 8520 },
    { rank: 5, username: 'void_walker', displayName: 'Dante Cross', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=void_walker&size=64', time: 61.4, score: 8140 },
    { rank: 6, username: 'arcade_queen', displayName: 'Elena Rostova', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arcade_queen&size=64', time: 67.8, score: 7760 },
    { rank: 7, username: 'breakout_pro', displayName: 'Marcus Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakout_pro&size=64', time: 74.2, score: 7390 },
    { rank: 8, username: 'pixel_guy', displayName: 'Leo Martinez', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pixel_guy&size=64', time: 82.0, score: 6980 },
    { rank: 9, username: 'quantum_ace', displayName: 'Devon Ward', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_ace&size=64', time: 91.5, score: 6540 },
    { rank: 10, username: 'solar_flare', displayName: 'Maya Patel', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=solar_flare&size=64', time: 103.2, score: 6100 },
  ],

  // 2. ELS01: Quantum Nexus (Dual Quantum Portals - 8 Registered Demo Players)
  ELS01: [
    { rank: 1, username: 'quantum_ace', displayName: 'Devon Ward', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_ace&size=64', time: 42.1, score: 9550 },
    { rank: 2, username: 'nova_cadet', displayName: 'Aria Chen', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nova_cadet&size=64', time: 46.5, score: 9230 },
    { rank: 3, username: 'laser_runner', displayName: 'Zack Miller', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=laser_runner&size=64', time: 52.0, score: 8810 },
    { rank: 4, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 57.8, score: 8440 },
    { rank: 5, username: 'crypto_striker', displayName: "Finn O'Connor", avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=crypto_striker&size=64', time: 64.3, score: 8020 },
    { rank: 6, username: 'echo_pulse', displayName: 'Sora Tanaka', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=echo_pulse&size=64', time: 72.1, score: 7580 },
    { rank: 7, username: 'zero_gravity', displayName: 'Aiden Brooks', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=zero_gravity&size=64', time: 81.6, score: 7120 },
    { rank: 8, username: 'cyber_ninja', displayName: 'Kenji Takahashi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_ninja&size=64', time: 94.0, score: 6640 },
  ],

  // 3. ELS02: Cyber Horizon (Wide EMP Barrier Stage - 8 Registered Demo Players)
  ELS02: [
    { rank: 1, username: 'retro_pilot', displayName: 'Viktor Novak', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=retro_pilot&size=64', time: 44.6, score: 9380 },
    { rank: 2, username: 'plasma_storm', displayName: 'Garrick Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=plasma_storm&size=64', time: 49.2, score: 9020 },
    { rank: 3, username: 'nebula_rider', displayName: 'Talia Reyes', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nebula_rider&size=64', time: 54.8, score: 8650 },
    { rank: 4, username: 'arcade_queen', displayName: 'Elena Rostova', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arcade_queen&size=64', time: 60.5, score: 8290 },
    { rank: 5, username: 'breakout_pro', displayName: 'Marcus Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakout_pro&size=64', time: 68.0, score: 7850 },
    { rank: 6, username: 'titan_vanguard', displayName: 'Kaelen Drake', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=titan_vanguard&size=64', time: 76.4, score: 7420 },
    { rank: 7, username: 'pixel_guy', displayName: 'Leo Martinez', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pixel_guy&size=64', time: 86.2, score: 6940 },
    { rank: 8, username: 'blaze_core', displayName: 'Ruby Gallagher', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=blaze_core&size=64', time: 98.5, score: 6410 },
  ],

  // 4. ELS03: Overdrive Matrix (Multi-Layer Fortress - 9 Registered Demo Players)
  ELS03: [
    { rank: 1, username: 'hyper_dash', displayName: 'Lucas Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hyper_dash&size=64', time: 46.2, score: 9280 },
    { rank: 2, username: 'blaze_core', displayName: 'Ruby Gallagher', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=blaze_core&size=64', time: 50.8, score: 8940 },
    { rank: 3, username: 'shadow_pulse', displayName: 'Zane Mercer', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=shadow_pulse&size=64', time: 55.9, score: 8590 },
    { rank: 4, username: 'flux_runner', displayName: 'Nadia Vos', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=flux_runner&size=64', time: 62.1, score: 8210 },
    { rank: 5, username: 'vortex_pilot', displayName: 'Rowan Sterling', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vortex_pilot&size=64', time: 69.4, score: 7780 },
    { rank: 6, username: 'stellar_hawk', displayName: 'Jaxson Reed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=stellar_hawk&size=64', time: 77.8, score: 7350 },
    { rank: 7, username: 'glitch_hunter', displayName: 'Kira Jensen', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=glitch_hunter&size=64', time: 86.5, score: 6910 },
    { rank: 8, username: 'byte_striker', displayName: 'Milo Hoffman', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=byte_striker&size=64', time: 96.0, score: 6480 },
    { rank: 9, username: 'cyber_ninja', displayName: 'Kenji Takahashi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_ninja&size=64', time: 107.5, score: 6050 },
  ],

  // 5. CYB01: Cyber Grid (Fast Rhythm Grid - 10 Registered Demo Players)
  CYB01: [
    { rank: 1, username: 'byte_striker', displayName: 'Milo Hoffman', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=byte_striker&size=64', time: 39.5, score: 9680 },
    { rank: 2, username: 'warp_driver', displayName: 'Selene Ruiz', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=warp_driver&size=64', time: 43.2, score: 9410 },
    { rank: 3, username: 'chrono_speeder', displayName: 'Julian Frost', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=chrono_speeder&size=64', time: 47.8, score: 9100 },
    { rank: 4, username: 'drift_master', displayName: 'Rina Sato', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=drift_master&size=64', time: 53.0, score: 8750 },
    { rank: 5, username: 'aero_blade', displayName: 'Darius Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=aero_blade&size=64', time: 59.2, score: 8360 },
    { rank: 6, username: 'pulse_forge', displayName: 'Vaughn Miller', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pulse_forge&size=64', time: 66.5, score: 7920 },
    { rank: 7, username: 'prism_strike', displayName: 'Lyra Mercer', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=prism_strike&size=64', time: 74.8, score: 7490 },
    { rank: 8, username: 'photon_wave', displayName: 'Kiran Rao', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=photon_wave&size=64', time: 83.9, score: 7040 },
    { rank: 9, username: 'sonic_rebound', displayName: 'Asher Quinn', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=sonic_rebound&size=64', time: 94.2, score: 6580 },
    { rank: 10, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 106.0, score: 6120 },
  ],

  // 6. ARC88: Neon Invaders (Retro Space Invader Layout - 9 Registered Demo Players)
  ARC88: [
    { rank: 1, username: 'pixel_guy', displayName: 'Leo Martinez', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pixel_guy&size=64', time: 45.4, score: 9340 },
    { rank: 2, username: 'arc_reactor', displayName: 'Brynne Hall', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arc_reactor&size=64', time: 49.8, score: 9050 },
    { rank: 3, username: 'vector_dash', displayName: 'Cassian Cruz', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vector_dash&size=64', time: 55.1, score: 8680 },
    { rank: 4, username: 'zenith_star', displayName: 'Talon Pierce', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=zenith_star&size=64', time: 61.2, score: 8310 },
    { rank: 5, username: 'cosmo_seeker', displayName: 'Vesper Lin', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cosmo_seeker&size=64', time: 68.6, score: 7890 },
    { rank: 6, username: 'arcade_queen', displayName: 'Elena Rostova', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arcade_queen&size=64', time: 76.9, score: 7450 },
    { rank: 7, username: 'hyper_ion', displayName: 'Tobias Blake', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hyper_ion&size=64', time: 86.0, score: 6980 },
    { rank: 8, username: 'star_glider', displayName: 'Mira Sterling', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=star_glider&size=64', time: 96.5, score: 6510 },
    { rank: 9, username: 'orbit_knight', displayName: 'Eamon Walsh', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=orbit_knight&size=64', time: 108.4, score: 6050 },
  ],

  // 7. VORTX: Vortex Rift (Deep Space Singularity - 8 Registered Demo Players)
  VORTX: [
    { rank: 1, username: 'void_walker', displayName: 'Dante Cross', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=void_walker&size=64', time: 47.0, score: 9240 },
    { rank: 2, username: 'matrix_cadet', displayName: 'Noemi Frost', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=matrix_cadet&size=64', time: 52.4, score: 8890 },
    { rank: 3, username: 'spark_runner', displayName: 'Kellan Zhao', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=spark_runner&size=64', time: 58.6, score: 8510 },
    { rank: 4, username: 'aegis_core', displayName: 'Damon Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=aegis_core&size=64', time: 65.9, score: 8080 },
    { rank: 5, username: 'flux_cadet', displayName: 'Isla Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=flux_cadet&size=64', time: 74.0, score: 7620 },
    { rank: 6, username: 'quantum_ace', displayName: 'Devon Ward', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_ace&size=64', time: 83.2, score: 7180 },
    { rank: 7, username: 'nano_striker', displayName: 'Cedric Roy', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nano_striker&size=64', time: 93.8, score: 6690 },
    { rank: 8, username: 'beacon_prime', displayName: 'Orion Vale', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=beacon_prime&size=64', time: 106.0, score: 6200 },
  ],

  // 8. STEEL: Titan Fortress (Heavy Armor Shielding - 7 Registered Demo Players)
  STEEL: [
    { rank: 1, username: 'titan_vanguard', displayName: 'Kaelen Drake', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=titan_vanguard&size=64', time: 48.9, score: 9140 },
    { rank: 2, username: 'vanguard_zero', displayName: 'Zephyr Cole', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vanguard_zero&size=64', time: 54.3, score: 8780 },
    { rank: 3, username: 'breakout_pro', displayName: 'Marcus Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=breakout_pro&size=64', time: 61.0, score: 8380 },
    { rank: 4, username: 'retro_pilot', displayName: 'Viktor Novak', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=retro_pilot&size=64', time: 69.5, score: 7920 },
    { rank: 5, username: 'cyber_ninja', displayName: 'Kenji Takahashi', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cyber_ninja&size=64', time: 79.2, score: 7450 },
    { rank: 6, username: 'nova_cadet', displayName: 'Aria Chen', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nova_cadet&size=64', time: 90.4, score: 6950 },
    { rank: 7, username: 'laser_runner', displayName: 'Zack Miller', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=laser_runner&size=64', time: 103.8, score: 6420 },
  ],

  // 9. PYRAM: Cyber Pyramid (Geometric Apex - 7 Registered Demo Players)
  PYRAM: [
    { rank: 1, username: 'solar_flare', displayName: 'Maya Patel', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=solar_flare&size=64', time: 44.8, score: 9380 },
    { rank: 2, username: 'crypto_striker', displayName: "Finn O'Connor", avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=crypto_striker&size=64', time: 50.1, score: 9030 },
    { rank: 3, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 56.4, score: 8640 },
    { rank: 4, username: 'arcade_queen', displayName: 'Elena Rostova', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arcade_queen&size=64', time: 64.0, score: 8200 },
    { rank: 5, username: 'echo_pulse', displayName: 'Sora Tanaka', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=echo_pulse&size=64', time: 73.2, score: 7720 },
    { rank: 6, username: 'zero_gravity', displayName: 'Aiden Brooks', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=zero_gravity&size=64', time: 84.5, score: 7210 },
    { rank: 7, username: 'plasma_storm', displayName: 'Garrick Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=plasma_storm&size=64', time: 98.0, score: 6650 },
  ],

  // 10. FLASH: Velocity Circuit (Ultra Sonic Reflexes - 8 Registered Demo Players)
  FLASH: [
    { rank: 1, username: 'speedy_sam', displayName: 'Samantha Speed', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=speedy_sam&size=64', time: 38.6, score: 9750 },
    { rank: 2, username: 'hyper_dash', displayName: 'Lucas Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=hyper_dash&size=64', time: 42.9, score: 9460 },
    { rank: 3, username: 'chrono_speeder', displayName: 'Julian Frost', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=chrono_speeder&size=64', time: 48.0, score: 9120 },
    { rank: 4, username: 'laser_runner', displayName: 'Zack Miller', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=laser_runner&size=64', time: 54.2, score: 8720 },
    { rank: 5, username: 'drift_master', displayName: 'Rina Sato', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=drift_master&size=64', time: 61.8, score: 8280 },
    { rank: 6, username: 'aero_blade', displayName: 'Darius Vance', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=aero_blade&size=64', time: 71.0, score: 7800 },
    { rank: 7, username: 'spark_runner', displayName: 'Kellan Zhao', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=spark_runner&size=64', time: 82.5, score: 7310 },
    { rank: 8, username: 'vector_dash', displayName: 'Cassian Cruz', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vector_dash&size=64', time: 95.8, score: 6780 },
  ],

  // 11. COSMO: Cosmo Labyrinth (Orbital Deep Vault - 7 Registered Demo Players)
  COSMO: [
    { rank: 1, username: 'cosmo_seeker', displayName: 'Vesper Lin', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=cosmo_seeker&size=64', time: 46.8, score: 9240 },
    { rank: 2, username: 'star_glider', displayName: 'Mira Sterling', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=star_glider&size=64', time: 52.0, score: 8910 },
    { rank: 3, username: 'zenith_star', displayName: 'Talon Pierce', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=zenith_star&size=64', time: 58.4, score: 8530 },
    { rank: 4, username: 'quantum_ace', displayName: 'Devon Ward', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=quantum_ace&size=64', time: 66.2, score: 8100 },
    { rank: 5, username: 'nebula_rider', displayName: 'Talia Reyes', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nebula_rider&size=64', time: 75.8, score: 7640 },
    { rank: 6, username: 'vortex_pilot', displayName: 'Rowan Sterling', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=vortex_pilot&size=64', time: 87.0, score: 7150 },
    { rank: 7, username: 'orbit_knight', displayName: 'Eamon Walsh', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=orbit_knight&size=64', time: 100.5, score: 6620 },
  ],

  // 12. PRISM: Prismatic Core (Color Refraction - 7 Registered Demo Players)
  PRISM: [
    { rank: 1, username: 'prism_strike', displayName: 'Lyra Mercer', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=prism_strike&size=64', time: 45.2, score: 9350 },
    { rank: 2, username: 'photon_wave', displayName: 'Kiran Rao', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=photon_wave&size=64', time: 50.8, score: 8990 },
    { rank: 3, username: 'pulse_forge', displayName: 'Vaughn Miller', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=pulse_forge&size=64', time: 57.5, score: 8590 },
    { rank: 4, username: 'blaze_core', displayName: 'Ruby Gallagher', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=blaze_core&size=64', time: 65.6, score: 8140 },
    { rank: 5, username: 'plasma_storm', displayName: 'Garrick Thorne', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=plasma_storm&size=64', time: 75.0, score: 7680 },
    { rank: 6, username: 'neon_striker', displayName: 'Chloe Bennett', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=neon_striker&size=64', time: 86.4, score: 7190 },
    { rank: 7, username: 'arc_reactor', displayName: 'Brynne Hall', avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=arc_reactor&size=64', time: 99.8, score: 6680 },
  ],
};
