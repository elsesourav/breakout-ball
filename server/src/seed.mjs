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
  16.2, 18.5, 21.0, 24.3, 27.8, // Levels 1 - 5 (Sector 1: Neon Alley)
  22.4, 25.1, 28.6, 31.2, 35.0, // Levels 6 - 10
  26.0, 29.5, 33.2, 36.8, 41.5, // Levels 11 - 15 (Sector 2: Pulse Grid)
  28.2, 32.0, 36.5, 40.1, 45.8, // Levels 16 - 20
  31.5, 35.2, 39.8, 44.0, 49.5, // Levels 21 - 25 (Sector 3: Quantum Void)
  34.0, 38.5, 43.2, 47.9, 53.6, // Levels 26 - 30
  36.5, 41.2, 45.8, 50.1, 55.4, // Levels 31 - 35 (Sector 4: Cyber Bastion)
  39.0, 43.5, 48.0, 52.8, 58.2, // Levels 36 - 40
  42.5, 47.0, 51.8, 56.5, 62.1, // Levels 41 - 45 (Sector 5: Hyper Core Overdrive)
  45.0, 49.8, 55.2, 61.0, 67.5, // Levels 46 - 50 (Apex Climax Summit)
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
  { trophyId: 'apex_champion', title: 'Apex Legend', description: 'Conquer all 50 arcade campaign stages', category: 'mastery' },
  { trophyId: 'level_architect', title: 'Master Architect', description: 'Create and save a custom stage in the Studio', category: 'creative' },
  { trophyId: 'arena_challenger', title: 'Global Contender', description: 'Challenge a community stage in Global Arena', category: 'mastery' },
];

export function seedDatabase() {
  console.log('[Seed] Seeding 50 real pre-players with 30-level progressive activity history...');

  // Reset existing data cleanly
  db.exec(`
    DELETE FROM coupon_redemptions;
    DELETE FROM activity_logs;
    DELETE FROM level_completions;
    DELETE FROM user_trophies;
    DELETE FROM users;
    DELETE FROM coupons;
  `);

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

  // 2. Seed Each Player with Progressive 30-Level Completions & Individual Activity Logs
  const now = Date.now();

  PRE_PLAYERS.forEach((player, pIdx) => {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(player.username)}&size=64`;
    
    // Stages completed gracefully scales: top 3 have completed all 50 campaign levels
    let levelsToComplete = 50;
    if (pIdx < 3) {
      levelsToComplete = 50;
    } else if (pIdx < 5) {
      levelsToComplete = 49;
    } else if (pIdx < 7) {
      levelsToComplete = 48;
    } else if (pIdx < 9) {
      levelsToComplete = 47;
    } else if (pIdx < 12) {
      levelsToComplete = 46 - (pIdx - 9);
    } else if (pIdx < 20) {
      levelsToComplete = 44 - Math.floor((pIdx - 12) * 0.6);
    } else if (pIdx < 35) {
      levelsToComplete = 39 - Math.floor((pIdx - 20) * 0.85);
    } else {
      levelsToComplete = Math.max(14, 26 - Math.floor((pIdx - 35) * 0.85));
    }

    const joinOffsetDays = 35 + (50 - pIdx) * 0.4;
    const joinTime = new Date(now - joinOffsetDays * 24 * 3600 * 1000).toISOString();

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

    // Record initial profile join activity
    activityRepository.log(
      'user_joined',
      player.username,
      `${player.fullName} (@${player.username}) initialized pilot profile credentials`,
      { rank: pIdx + 1, skill: player.baseSkill },
      joinTime
    );

    let cumulativeScore = 0;

    // Simulate completion of levels 1 through levelsToComplete one by one
    for (let lvl = 1; lvl <= levelsToComplete; lvl++) {
      const baseTime = BASE_LEVEL_TIMES[lvl - 1] || (30 + lvl);
      const timeVariance = (1.05 - player.baseSkill * 0.2) + ((pIdx * 7 + lvl * 13) % 17 - 8) * 0.008;
      const timeUsed = Math.max(9.8, Math.round(baseTime * timeVariance * 10) / 10);
      
      const lives = player.baseSkill > 0.75 || (lvl + pIdx) % 3 !== 0 ? 3 : ((lvl + pIdx) % 2 === 0 ? 2 : 1);
      const stars = lives === 3 ? 3 : (lives === 2 ? 2 : 1);
      const basePts = 5800 + (lvl % 5) * 120;
      const timeBonus = Math.max(250, Math.floor(1000 - timeUsed * 14));
      const score = Math.floor((basePts + timeBonus + lives * 220) * (0.90 + player.baseSkill * 0.18));

      cumulativeScore += score;

      // Completion timestamp staggered chronologically
      const daysAgo = Math.max(0.2, (31 - lvl) * 0.95 + (pIdx * 0.06));
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

      // Record activity log one by one for each level completion
      activityRepository.log(
        'level_completed',
        player.username,
        `Cleared Sector ${lvl} with ${score.toLocaleString()} PTS in ${timeUsed.toFixed(1)}s (${stars}⭐)`,
        { levelId: String(lvl), timeUsed, score, stars },
        completionTime
      );
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
    if (levelsToComplete >= 50) trophiesToAward.push(AVAILABLE_TROPHIES[8]); // apex_champion
    if (pIdx % 3 === 0) trophiesToAward.push(AVAILABLE_TROPHIES[9]); // level_architect
    if (pIdx % 2 === 0) trophiesToAward.push(AVAILABLE_TROPHIES[10]); // arena_challenger

    for (let tIdx = 0; tIdx < trophiesToAward.length; tIdx++) {
      const tr = trophiesToAward[tIdx];
      const trId = `tr_${player.username}_${tr.trophyId}`;
      const unlockDaysAgo = Math.max(0.5, 28 - tIdx * 2.5 + (pIdx * 0.05));
      const unlockTime = new Date(now - unlockDaysAgo * 24 * 3600 * 1000).toISOString();
      db.prepare(`
        INSERT OR IGNORE INTO user_trophies (id, user_id, username, trophy_id, title, description, category, unlocked_at)
        VALUES (?, (SELECT id FROM users WHERE username = ?), ?, ?, ?, ?, ?, ?)
      `).run(trId, player.username, player.username, tr.trophyId, tr.title, tr.description, tr.category, unlockTime);

      // Record activity log for each trophy unlocked
      activityRepository.log(
        'trophy_unlocked',
        player.username,
        `Unlocked Trophy [${tr.title}]: ${tr.description}`,
        { trophyId: tr.trophyId, title: tr.title, category: tr.category },
        unlockTime
      );
    }

    // Simulate coupon redemption for selected active pilots
    if (pIdx % 4 === 0) {
      const couponCode = pIdx % 8 === 0 ? 'CORE500' : 'CORE100';
      const c = promoCoupons.find(pc => pc.code === couponCode);
      if (c) {
        const redeemTime = new Date(now - (12 + pIdx * 0.2) * 24 * 3600 * 1000).toISOString();
        const rId = `rd_seed_${player.username}_${couponCode}`;
        db.prepare(`
          INSERT OR IGNORE INTO coupon_redemptions (id, coupon_code, username, cores_granted, ip_address, redeemed_at)
          VALUES (?, ?, ?, ?, '127.0.0.1', ?)
        `).run(rId, couponCode, player.username, c.rewardCores, redeemTime);
        db.prepare('UPDATE coupons SET used_count = used_count + 1 WHERE code = ?').run(couponCode);
        
        activityRepository.log(
          'coupon_redeemed',
          player.username,
          `Redeemed cyber promo code ${couponCode} (+${c.rewardCores} Cores)`,
          { code: couponCode, cores: c.rewardCores },
          redeemTime
        );
      }
    }

    // Update aggregate stats on user
    db.prepare(`
      UPDATE users 
      SET total_score = ?,
          trophy_count = ?,
          levels_completed = ?,
          last_active_at = ?
      WHERE username = ?
    `).run(
      cumulativeScore,
      trophiesToAward.length,
      levelsToComplete,
      new Date(now - pIdx * 1800 * 1000).toISOString(),
      player.username
    );
  });

  // 3. Seed Registered Demo Pilots for Top Arena Stages
  const ARENA_SEED_COMPLETIONS = {
    CHAMP: [
      { username: 'cyber_ninja', time: 43.8, score: 9420 },
      { username: 'speedy_sam', time: 47.2, score: 9180 },
      { username: 'hyper_dash', time: 51.5, score: 8850 },
      { username: 'neon_striker', time: 56.1, score: 8520 },
      { username: 'void_walker', time: 61.4, score: 8140 },
      { username: 'arcade_queen', time: 67.8, score: 7760 },
      { username: 'breakout_pro', time: 74.2, score: 7390 },
      { username: 'pixel_guy', time: 82.0, score: 6980 },
      { username: 'quantum_ace', time: 91.5, score: 6540 },
      { username: 'solar_flare', time: 103.2, score: 6100 },
    ],
    ELS01: [
      { username: 'quantum_ace', time: 42.1, score: 9550 },
      { username: 'nova_cadet', time: 46.5, score: 9230 },
      { username: 'laser_runner', time: 52.0, score: 8810 },
      { username: 'speedy_sam', time: 57.8, score: 8440 },
      { username: 'crypto_striker', time: 64.3, score: 8020 },
      { username: 'echo_pulse', time: 72.1, score: 7580 },
      { username: 'zero_gravity', time: 81.6, score: 7120 },
      { username: 'cyber_ninja', time: 94.0, score: 6640 },
    ],
    ELS02: [
      { username: 'retro_pilot', time: 44.6, score: 9380 },
      { username: 'plasma_storm', time: 49.2, score: 9020 },
      { username: 'nebula_rider', time: 54.8, score: 8650 },
      { username: 'arcade_queen', time: 60.5, score: 8290 },
      { username: 'breakout_pro', time: 68.0, score: 7850 },
      { username: 'titan_vanguard', time: 76.4, score: 7420 },
      { username: 'pixel_guy', time: 86.2, score: 6940 },
      { username: 'blaze_core', time: 98.5, score: 6410 },
    ],
    ELS03: [
      { username: 'hyper_dash', time: 46.2, score: 9280 },
      { username: 'blaze_core', time: 50.8, score: 8940 },
      { username: 'shadow_pulse', time: 55.9, score: 8590 },
      { username: 'flux_runner', time: 62.1, score: 8210 },
      { username: 'vortex_pilot', time: 69.4, score: 7780 },
      { username: 'stellar_hawk', time: 77.8, score: 7350 },
      { username: 'glitch_hunter', time: 86.5, score: 6910 },
      { username: 'byte_striker', time: 96.0, score: 6480 },
      { username: 'cyber_ninja', time: 107.5, score: 6050 },
    ],
    CYB01: [
      { username: 'byte_striker', time: 39.5, score: 9680 },
      { username: 'warp_driver', time: 43.2, score: 9410 },
      { username: 'chrono_speeder', time: 47.8, score: 9100 },
      { username: 'drift_master', time: 53.0, score: 8750 },
      { username: 'aero_blade', time: 59.2, score: 8360 },
      { username: 'pulse_forge', time: 66.5, score: 7920 },
      { username: 'prism_strike', time: 74.8, score: 7490 },
      { username: 'photon_wave', time: 83.9, score: 7040 },
      { username: 'sonic_rebound', time: 94.2, score: 6580 },
      { username: 'speedy_sam', time: 106.0, score: 6120 },
    ],
    ARC88: [
      { username: 'pixel_guy', time: 45.4, score: 9340 },
      { username: 'arc_reactor', time: 49.8, score: 9050 },
      { username: 'vector_dash', time: 55.1, score: 8680 },
      { username: 'zenith_star', time: 61.2, score: 8310 },
      { username: 'cosmo_seeker', time: 68.6, score: 7890 },
      { username: 'arcade_queen', time: 76.9, score: 7450 },
      { username: 'hyper_ion', time: 86.0, score: 6980 },
      { username: 'star_glider', time: 96.5, score: 6510 },
      { username: 'orbit_knight', time: 108.4, score: 6050 },
    ],
    VORTX: [
      { username: 'void_walker', time: 47.0, score: 9240 },
      { username: 'matrix_cadet', time: 52.4, score: 8890 },
      { username: 'spark_runner', time: 58.6, score: 8510 },
      { username: 'aegis_core', time: 65.9, score: 8080 },
      { username: 'flux_cadet', time: 74.0, score: 7620 },
      { username: 'quantum_ace', time: 83.2, score: 7180 },
      { username: 'nano_striker', time: 93.8, score: 6690 },
      { username: 'beacon_prime', time: 106.0, score: 6200 },
    ],
    STEEL: [
      { username: 'titan_vanguard', time: 48.9, score: 9140 },
      { username: 'vanguard_zero', time: 54.3, score: 8780 },
      { username: 'breakout_pro', time: 61.0, score: 8380 },
      { username: 'retro_pilot', time: 69.5, score: 7920 },
      { username: 'cyber_ninja', time: 79.2, score: 7450 },
      { username: 'nova_cadet', time: 90.4, score: 6950 },
      { username: 'laser_runner', time: 103.8, score: 6420 },
    ],
    PYRAM: [
      { username: 'solar_flare', time: 44.8, score: 9380 },
      { username: 'crypto_striker', time: 50.1, score: 9030 },
      { username: 'speedy_sam', time: 56.4, score: 8640 },
      { username: 'arcade_queen', time: 64.0, score: 8200 },
      { username: 'echo_pulse', time: 73.2, score: 7720 },
      { username: 'zero_gravity', time: 84.5, score: 7210 },
      { username: 'plasma_storm', time: 98.0, score: 6650 },
    ],
    FLASH: [
      { username: 'speedy_sam', time: 38.6, score: 9750 },
      { username: 'hyper_dash', time: 42.9, score: 9460 },
      { username: 'chrono_speeder', time: 48.0, score: 9120 },
      { username: 'laser_runner', time: 54.2, score: 8720 },
      { username: 'drift_master', time: 61.8, score: 8280 },
      { username: 'aero_blade', time: 71.0, score: 7800 },
      { username: 'spark_runner', time: 82.5, score: 7310 },
      { username: 'vector_dash', time: 95.8, score: 6780 },
    ],
    COSMO: [
      { username: 'cosmo_seeker', time: 46.8, score: 9240 },
      { username: 'star_glider', time: 52.0, score: 8910 },
      { username: 'zenith_star', time: 58.4, score: 8530 },
      { username: 'quantum_ace', time: 66.2, score: 8100 },
      { username: 'nebula_rider', time: 75.8, score: 7640 },
      { username: 'vortex_pilot', time: 87.0, score: 7150 },
      { username: 'orbit_knight', time: 100.5, score: 6620 },
    ],
    PRISM: [
      { username: 'prism_strike', time: 45.2, score: 9350 },
      { username: 'photon_wave', time: 50.8, score: 8990 },
      { username: 'pulse_forge', time: 57.5, score: 8590 },
      { username: 'blaze_core', time: 65.6, score: 8140 },
      { username: 'plasma_storm', time: 75.0, score: 7680 },
      { username: 'neon_striker', time: 86.4, score: 7190 },
      { username: 'arc_reactor', time: 99.8, score: 6680 },
    ],
  };

  for (const [arenaLevelId, entries] of Object.entries(ARENA_SEED_COMPLETIONS)) {
    entries.forEach((entry, eIdx) => {
      const lcId = `lc_${entry.username}_${arenaLevelId}`;
      const completionTime = new Date(now - (12 - eIdx * 0.4) * 24 * 3600 * 1000).toISOString();
      db.prepare(`
        INSERT INTO level_completions (id, username, level_id, time_used, lives_remaining, score, stars, completed_at)
        VALUES (?, ?, ?, ?, 3, ?, 3, ?)
        ON CONFLICT(username, level_id) DO UPDATE SET
          time_used = excluded.time_used,
          score = excluded.score,
          stars = excluded.stars
      `).run(lcId, entry.username, arenaLevelId, entry.time, entry.score, completionTime);
    });
  }

  console.log(`[Seed] Successfully populated ${PRE_PLAYERS.length} cyber pre-players across 50 campaign levels and top arena stages!`);
}

// Auto-run if executed directly via node
if (process.argv[1]?.endsWith('seed.mjs')) {
  seedDatabase();
}
