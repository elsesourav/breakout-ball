import { db, userRepository, trophyRepository, completionRepository, couponRepository, activityRepository } from './db.mjs';

export const PRE_PLAYERS = [
  { username: 'sourav', fullName: 'Sourav Elsesourav', title: 'Grandmaster Champion', baseSkill: 0.98 },
  { username: 'speedy_sam', fullName: 'Samantha Speed', title: 'Speedrun Ace', baseSkill: 0.96 },
  { username: 'arcade_queen', fullName: 'Elena Rostova', title: 'Arcade Monarch', baseSkill: 0.94 },
  { username: 'cyber_ninja', fullName: 'Kenji Takahashi', title: 'Shadow Striker', baseSkill: 0.93 },
  { username: 'breakout_pro', fullName: 'Marcus Vance', title: 'Core Crusher', baseSkill: 0.91 },
  { username: 'pixel_guy', fullName: 'Leo Martinez', title: 'Pixel Veteran', baseSkill: 0.89 },
  { username: 'neon_striker', fullName: 'Chloe Bennett', title: 'Neon Phantom', baseSkill: 0.88 },
  { username: 'quantum_ace', fullName: 'Devon Ward', title: 'Warp Navigator', baseSkill: 0.87 },
  { username: 'hyper_dash', fullName: 'Lucas Thorne', title: 'Hyperion Pilot', baseSkill: 0.85 },
  { username: 'retro_pilot', fullName: 'Viktor Novak', title: 'Old-School Breaker', baseSkill: 0.84 },
  { username: 'nova_cadet', fullName: 'Aria Chen', title: 'Nova Specialist', baseSkill: 0.83 },
  { username: 'laser_runner', fullName: 'Zack Miller', title: 'Beam Specialist', baseSkill: 0.82 },
  { username: 'solar_flare', fullName: 'Maya Patel', title: 'Solar Vanguard', baseSkill: 0.81 },
  { username: 'void_walker', fullName: 'Dante Cross', title: 'Abyssal Nomad', baseSkill: 0.80 },
  { username: 'crypto_striker', fullName: 'Finn O\'Connor', title: 'Cipher Specialist', baseSkill: 0.79 },
  { username: 'echo_pulse', fullName: 'Sora Tanaka', title: 'Resonance Pilot', baseSkill: 0.78 },
  { username: 'zero_gravity', fullName: 'Aiden Brooks', title: 'Float Specialist', baseSkill: 0.77 },
  { username: 'plasma_storm', fullName: 'Garrick Thorne', title: 'Ion Disruptor', baseSkill: 0.76 },
  { username: 'nebula_rider', fullName: 'Talia Reyes', title: 'Starlight Drifter', baseSkill: 0.75 },
  { username: 'omega_cadet', fullName: 'Felix Moreau', title: 'Sector Recruit', baseSkill: 0.74 },
  { username: 'titan_vanguard', fullName: 'Kaelen Drake', title: 'Heavy Sentinel', baseSkill: 0.73 },
  { username: 'blaze_core', fullName: 'Ruby Gallagher', title: 'Inferno Pilot', baseSkill: 0.72 },
  { username: 'shadow_pulse', fullName: 'Zane Mercer', title: 'Stealth Breaker', baseSkill: 0.71 },
  { username: 'flux_runner', fullName: 'Nadia Vos', title: 'Kinetic Courier', baseSkill: 0.70 },
  { username: 'vortex_pilot', fullName: 'Rowan Sterling', title: 'Graviton Striker', baseSkill: 0.69 },
  { username: 'stellar_hawk', fullName: 'Jaxson Reed', title: 'Celestial Scout', baseSkill: 0.68 },
  { username: 'glitch_hunter', fullName: 'Kira Jensen', title: 'Bug Detonator', baseSkill: 0.67 },
  { username: 'byte_striker', fullName: 'Milo Hoffman', title: 'Data Striker', baseSkill: 0.66 },
  { username: 'warp_driver', fullName: 'Selene Ruiz', title: 'Tesseract Pilot', baseSkill: 0.65 },
  { username: 'chrono_speeder', fullName: 'Julian Frost', title: 'Time Manipulator', baseSkill: 0.64 },
  { username: 'drift_master', fullName: 'Rina Sato', title: 'Apex Slider', baseSkill: 0.63 },
  { username: 'aero_blade', fullName: 'Darius Vance', title: 'Edge Runner', baseSkill: 0.62 },
  { username: 'pulse_forge', fullName: 'Vaughn Miller', title: 'Alloy Smith', baseSkill: 0.61 },
  { username: 'prism_strike', fullName: 'Lyra Mercer', title: 'Refractor Ace', baseSkill: 0.60 },
  { username: 'photon_wave', fullName: 'Kiran Rao', title: 'Laser Cadet', baseSkill: 0.59 },
  { username: 'sonic_rebound', fullName: 'Asher Quinn', title: 'Acoustic Breaker', baseSkill: 0.58 },
  { username: 'arc_reactor', fullName: 'Brynne Hall', title: 'Tesla Gunner', baseSkill: 0.57 },
  { username: 'vector_dash', fullName: 'Cassian Cruz', title: 'Vector Cadet', baseSkill: 0.56 },
  { username: 'zenith_star', fullName: 'Talon Pierce', title: 'Apex Star', baseSkill: 0.55 },
  { username: 'cosmo_seeker', fullName: 'Vesper Lin', title: 'Deep Space Scout', baseSkill: 0.54 },
  { username: 'hyper_ion', fullName: 'Tobias Blake', title: 'Charge Master', baseSkill: 0.53 },
  { username: 'star_glider', fullName: 'Mira Sterling', title: 'Orbital Glider', baseSkill: 0.52 },
  { username: 'orbit_knight', fullName: 'Eamon Walsh', title: 'Defense Core', baseSkill: 0.51 },
  { username: 'matrix_cadet', fullName: 'Noemi Frost', title: 'Grid Runner', baseSkill: 0.50 },
  { username: 'spark_runner', fullName: 'Kellan Zhao', title: 'Volt Sprinter', baseSkill: 0.49 },
  { username: 'aegis_core', fullName: 'Damon Vance', title: 'Shield Bearer', baseSkill: 0.48 },
  { username: 'flux_cadet', fullName: 'Isla Thorne', title: 'Pulse Trainee', baseSkill: 0.47 },
  { username: 'nano_striker', fullName: 'Cedric Roy', title: 'Micro Breaker', baseSkill: 0.46 },
  { username: 'beacon_prime', fullName: 'Orion Vale', title: 'Beacon Sentinel', baseSkill: 0.45 },
  { username: 'vanguard_zero', fullName: 'Zephyr Cole', title: 'Origin Pioneer', baseSkill: 0.44 },
];

const BASE_LEVEL_TIMES = [
  16.2, 18.5, 21.0, 24.3, 27.8, // Levels 1 - 5 (Sector 1)
  22.4, 25.1, 28.6, 31.2, 35.0, // Levels 6 - 10 (Sector 2)
  26.0, 29.5, 33.2, 36.8, 41.5, // Levels 11 - 15 (Sector 3)
  28.2, 32.0, 36.5, 40.1, 45.8, // Levels 16 - 20 (Sector 4)
  31.5, 35.2, 39.8, 44.0, 49.5, // Levels 21 - 25 (Sector 5)
  34.0, 38.5, 43.2, 47.9, 53.6, // Levels 26 - 30 (Sector 6)
];

const AVAILABLE_TROPHIES = [
  { trophyId: 'first_blood', title: 'First Impact', description: 'Break your first energy block in any stage', category: 'combat' },
  { trophyId: 'combo_5', title: 'Combo Spark', description: 'Achieve a 5x combo streak without losing ball', category: 'combat' },
  { trophyId: 'combo_10', title: 'Unstoppable Flow', description: 'Reach a blistering 10x combo streak', category: 'combat' },
  { trophyId: 'portal_hopper', title: 'Quantum Leaper', description: 'Warp a ball through a pair of cyber portals', category: 'mastery' },
  { trophyId: 'emp_detonator', title: 'Shockwave Master', description: 'Detonate an EMP explosive block', category: 'combat' },
  { trophyId: 'speed_demon', title: 'Supersonic', description: 'Clear any level in under 30 seconds', category: 'speed' },
  { trophyId: 'campaign_10', title: 'Sector Veteran', description: 'Conquer 10 arcade campaign stages', category: 'mastery' },
  { trophyId: 'campaign_25', title: 'Cyber Warlord', description: 'Conquer 25 arcade campaign stages', category: 'mastery' },
  { trophyId: 'level_architect', title: 'Master Architect', description: 'Create and save a custom stage in the Studio', category: 'creative' },
  { trophyId: 'arena_challenger', title: 'Global Contender', description: 'Challenge a community stage in Global Arena', category: 'mastery' },
];

export function seedDatabase() {
  console.log('[Seed] Seeding 50 real pre-players with 30-level activity history...');

  // 1. Seed Official Promo Coupons
  const promoCoupons = [
    { code: 'CORE100', rewardCores: 100, packCores: 100, maxUses: 5000 },
    { code: 'CORE500', rewardCores: 500, packCores: 500, maxUses: 3000 },
    { code: 'CYBER1000', rewardCores: 1000, packCores: 1000, maxUses: 2000 },
    { code: 'TITAN5000', rewardCores: 5000, packCores: 5000, maxUses: 1000 },
    { code: 'APEXVIP', rewardCores: 10000, packCores: 10000, maxUses: 500 },
  ];

  for (const c of promoCoupons) {
    couponRepository.create(c);
  }

  // 2. Seed Each Player with Progressive 30-Level Completions
  const now = Date.now();

  PRE_PLAYERS.forEach((player, pIdx) => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.username)}&size=64`;
    
    // Skill determine how many levels they have completed (Top players have all 30 completed)
    let levelsToComplete = 30;
    if (pIdx > 5 && pIdx <= 15) levelsToComplete = Math.floor(25 + Math.random() * 5);
    else if (pIdx > 15 && pIdx <= 30) levelsToComplete = Math.floor(18 + Math.random() * 8);
    else if (pIdx > 30) levelsToComplete = Math.floor(10 + Math.random() * 12);

    // Initial user record
    userRepository.upsert({
      id: `usr_pre_${pIdx + 1}`,
      username: player.username,
      email: `${player.username}@breakout.cyber`,
      fullName: player.fullName,
      avatarUrl,
      trophyCount: 0,
      totalScore: 0,
      coresBalance: Math.floor(player.baseSkill * 3500),
      levelsCompleted: 0
    });

    let cumulativeScore = 0;

    // Simulate completion of levels 1 through levelsToComplete
    for (let lvl = 1; lvl <= levelsToComplete; lvl++) {
      const baseTime = BASE_LEVEL_TIMES[lvl - 1] || (30 + lvl);
      // Realistic variance based on player skill
      const timeVariance = (1.05 - player.baseSkill * 0.2) + (Math.random() * 0.12 - 0.06);
      const timeUsed = Math.max(10.5, Math.round(baseTime * timeVariance * 10) / 10);
      
      const lives = player.baseSkill > 0.8 || Math.random() > 0.3 ? 3 : (Math.random() > 0.5 ? 2 : 1);
      const stars = lives === 3 ? 3 : (lives === 2 ? 2 : 1);
      const basePts = 2000 + lvl * 350;
      const timeBonus = Math.max(200, Math.floor(1000 - timeUsed * 18));
      const score = Math.floor((basePts + timeBonus + lives * 250) * (0.9 + player.baseSkill * 0.25));

      cumulativeScore += score;

      // Completion timestamp staggered over the past 30 days
      const daysAgo = (31 - lvl) * 0.8 + (pIdx * 0.05);
      const completionTime = new Date(now - daysAgo * 24 * 3600 * 1000).toISOString();

      // Insert level completion directly
      const lcId = `lc_${player.username}_${lvl}`;
      db.prepare(`
        INSERT INTO level_completions (id, username, level_id, time_used, lives_remaining, score, stars, completed_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(username, level_id) DO UPDATE SET
          time_used = excluded.time_used,
          score = excluded.score,
          stars = excluded.stars
      `).run(lcId, player.username, String(lvl), timeUsed, lives, score, stars, completionTime);
    }

    // Assign appropriate trophies based on achievements
    const trophiesToAward = [];
    trophiesToAward.push(AVAILABLE_TROPHIES[0]); // first_blood
    if (levelsToComplete >= 3) trophiesToAward.push(AVAILABLE_TROPHIES[1]); // combo_5
    if (levelsToComplete >= 8 && player.baseSkill > 0.65) trophiesToAward.push(AVAILABLE_TROPHIES[2]); // combo_10
    if (levelsToComplete >= 5) trophiesToAward.push(AVAILABLE_TROPHIES[3]); // portal_hopper
    if (levelsToComplete >= 4) trophiesToAward.push(AVAILABLE_TROPHIES[4]); // emp_detonator
    if (player.baseSkill > 0.85) trophiesToAward.push(AVAILABLE_TROPHIES[5]); // speed_demon
    if (levelsToComplete >= 10) trophiesToAward.push(AVAILABLE_TROPHIES[6]); // campaign_10
    if (levelsToComplete >= 25) trophiesToAward.push(AVAILABLE_TROPHIES[7]); // campaign_25
    if (pIdx % 3 === 0) trophiesToAward.push(AVAILABLE_TROPHIES[8]); // level_architect
    if (pIdx % 2 === 0) trophiesToAward.push(AVAILABLE_TROPHIES[9]); // arena_challenger

    for (const tr of trophiesToAward) {
      const trId = `tr_${player.username}_${tr.trophyId}`;
      const unlockTime = new Date(now - (30 - trophiesToAward.length) * 24 * 3600 * 1000).toISOString();
      db.prepare(`
        INSERT OR IGNORE INTO user_trophies (id, user_id, username, trophy_id, title, description, category, unlocked_at)
        VALUES (?, (SELECT id FROM users WHERE username = ?), ?, ?, ?, ?, ?, ?)
      `).run(trId, player.username, player.username, tr.trophyId, tr.title, tr.description, tr.category, unlockTime);
    }

    // Update aggregate stats on user
    db.prepare(`
      UPDATE users 
      SET total_score = ?,
          trophy_count = ?,
          levels_completed = ?,
          last_active_at = ?
      WHERE username = ?
    `).run(cumulativeScore, trophiesToAward.length, levelsToComplete, new Date(now - pIdx * 1800 * 1000).toISOString(), player.username);

    // Initial join activity log
    activityRepository.log('user_joined', player.username, `${player.fullName} (@${player.username}) initialized pilot profile`);
  });

  console.log(`[Seed] Successfully populated ${PRE_PLAYERS.length} cyber pre-players across 30 campaign levels with real database records!`);
}

// Auto-run if executed directly via node
if (process.argv[1]?.endsWith('seed.mjs')) {
  seedDatabase();
}
