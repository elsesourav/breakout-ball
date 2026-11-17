import { LevelData, ActiveTab, GameScreen } from '../../types/game';
import { PageMetadata } from './types';
import { calculateLevelHp } from '../../utils/helpers';

const DEFAULT_BANNER = '/og-image.jpg';
const DEFAULT_TWITTER_CREATOR = '@elsesourav';

/**
 * Get sector information based on campaign level number (1 - 100)
 */
export const getCampaignSector = (levelNum: number): {
  number: string;
  name: string;
  subtitle: string;
  themeColor: string;
} => {
  if (levelNum <= 10) {
    return { number: '01', name: 'Neon Alley', subtitle: 'Classic Energy Matrix', themeColor: '#00f7ff' };
  }
  if (levelNum <= 20) {
    return { number: '02', name: 'Data Foundry', subtitle: 'Synthwave Multi-Strike', themeColor: '#38bdf8' };
  }
  if (levelNum <= 30) {
    return { number: '03', name: 'Quantum Core', subtitle: 'Portal Wormhole Nexus', themeColor: '#a855f7' };
  }
  if (levelNum <= 40) {
    return { number: '04', name: 'Cyber Citadel', subtitle: 'Heavy Armor Fortress', themeColor: '#f43f5e' };
  }
  if (levelNum <= 50) {
    return { number: '05', name: 'Orbital Apex', subtitle: 'High-Orbit Platform', themeColor: '#fbbf24' };
  }
  if (levelNum <= 60) {
    return { number: '06', name: 'Chrome Skyline', subtitle: 'Neo-Tokyo Megastructure', themeColor: '#2dd4bf' };
  }
  if (levelNum <= 70) {
    return { number: '07', name: 'Void Reactor', subtitle: 'Sub-Atomic Fission Lab', themeColor: '#ec4899' };
  }
  if (levelNum <= 80) {
    return { number: '08', name: 'Hyperion Grid', subtitle: 'Quantum Supercomputer', themeColor: '#6366f1' };
  }
  if (levelNum <= 90) {
    return { number: '09', name: 'Singularity Depths', subtitle: 'Event Horizon Gateway', themeColor: '#8b5cf6' };
  }
  return { number: '10', name: 'Omega Throne', subtitle: 'Final Transcendence Apex', themeColor: '#ff0055' };
};

/**
 * Build rich PageMetadata for a specific level (Campaign or Community/Arena)
 */
export const buildLevelMetadata = (
  level: LevelData,
  mode: 'preview' | 'playing' = 'preview'
): PageMetadata => {
  const levelNum = parseInt(level.id, 10);
  const isCampaign = !isNaN(levelNum) && levelNum >= 1 && levelNum <= 100;
  const stats = calculateLevelHp(level.blocks);

  if (isCampaign) {
    const sector = getCampaignSector(levelNum);
    const rawName = level.name || `Level ${levelNum}`;
    const cleanLevelName = rawName.replace(/^Level \d+:\s*/i, '');
    const title = `Level ${levelNum}: ${cleanLevelName} // Sector ${sector.number}: ${sector.name} | Breakout Ball`;
    const description = `Conquer Level ${levelNum} (${cleanLevelName}) in Sector ${sector.number}: ${sector.name}. Breach ${stats.breakableCount} crystal targets (${stats.totalHp} HP) and rank on the live global leaderboard.`;
    const canonicalUrl = `/level/${levelNum}`;

    return {
      title,
      description,
      keywords: [
        `level ${levelNum}`,
        cleanLevelName.toLowerCase(),
        `sector ${sector.number}`,
        sector.name.toLowerCase(),
        'breakout ball',
        'cyberpunk arcade',
        'brick breaker',
      ],
      canonicalUrl,
      themeColor: sector.themeColor,
      openGraph: {
        title: `Level ${levelNum}: ${cleanLevelName} - Sector ${sector.number} | Breakout Ball`,
        description: `Can you breach Level ${levelNum} in Breakout Ball? ${stats.breakableCount} targets, ${stats.totalHp} HP. Play free in browser!`,
        url: canonicalUrl,
        image: DEFAULT_BANNER,
        type: 'game',
        imageAlt: `Level ${levelNum}: ${cleanLevelName} - Breakout Ball Cyberpunk Neon Arcade`,
      },
      twitter: {
        card: 'summary_large_image',
        title: `Level ${levelNum}: ${cleanLevelName} | Breakout Ball`,
        description: `Conquer Level ${levelNum} in Sector ${sector.number}. Breach ${stats.breakableCount} targets & claim core rewards!`,
        image: DEFAULT_BANNER,
        creator: DEFAULT_TWITTER_CREATOR,
      },
      structuredData: {
        '@context': 'https://schema.org',
        '@type': 'VideoGame',
        name: `Breakout Ball - Level ${levelNum}: ${cleanLevelName}`,
        description,
        genre: ['Arcade', 'Action', 'Puzzle'],
        url: typeof window !== 'undefined' ? `${window.location.origin}${canonicalUrl}` : canonicalUrl,
        operatingSystem: 'Any modern web browser',
        applicationCategory: 'Game',
      },
    };
  }

  // Community / Arena Level
  const creatorTag = level.creator ? `@${level.creator}` : 'Community';
  const levelName = level.name || `Stage ${level.id}`;
  const title = `${levelName} by ${creatorTag} // Breakout Ball Arena`;
  const description = `Play custom community level "${levelName}" crafted by ${creatorTag} in Breakout Ball Arena. ${stats.breakableCount} breakable targets (${stats.totalHp} HP). Instant free browser play.`;
  const canonicalUrl = `/level/${encodeURIComponent(level.id)}`;

  return {
    title,
    description,
    keywords: [
      levelName.toLowerCase(),
      `by ${creatorTag}`,
      'community level',
      'breakout arena',
      'breakout ball',
      'custom brick breaker',
    ],
    canonicalUrl,
    themeColor: '#03040c',
    openGraph: {
      title: `${level.name} by ${creatorTag} | Breakout Ball Arena`,
      description: `Challenge custom level "${level.name}" by ${creatorTag} in Breakout Ball! Instant play in browser.`,
      url: canonicalUrl,
      image: DEFAULT_BANNER,
      type: 'game',
      imageAlt: `${level.name} by ${creatorTag} - Breakout Ball Arena`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${level.name} by ${creatorTag} | Breakout Ball`,
      description: `Play custom level "${level.name}" in Breakout Ball. High scores, quantum portals, and live leaderboards!`,
      image: DEFAULT_BANNER,
      creator: DEFAULT_TWITTER_CREATOR,
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'VideoGame',
      name: `Breakout Ball - ${level.name}`,
      author: {
        '@type': 'Person',
        name: level.creator || 'Community Creator',
      },
      description,
      genre: ['Arcade', 'Action', 'Custom Level'],
      url: typeof window !== 'undefined' ? `${window.location.origin}${canonicalUrl}` : canonicalUrl,
      operatingSystem: 'Any modern web browser',
    },
  };
};

/**
 * Build rich PageMetadata for default top-level navigation tabs
 */
export const buildTabMetadata = (tab: ActiveTab): PageMetadata => {
  switch (tab) {
    case 'online':
      return {
        title: 'Global Arena // Daily Apex & Community Levels | Breakout Ball',
        description: 'Compete in the Daily Apex mission, play top community-created levels, and battle for the #1 rank on global live leaderboards in Breakout Ball.',
        keywords: ['breakout arena', 'daily apex', 'community levels', 'live leaderboards', 'breakout ball', 'cyberpunk games'],
        canonicalUrl: '/arena',
        themeColor: '#03040c',
        openGraph: {
          title: 'Global Arena - Daily Apex & Community Missions | Breakout Ball',
          description: 'Compete on the Daily Apex mission and community levels. Free live multiplayer leaderboard battles in Breakout Ball.',
          url: '/arena',
          image: DEFAULT_BANNER,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Breakout Ball Arena - Daily Apex Challenge',
          description: 'Conquer the daily featured mission and community levels on Breakout Ball.',
          image: DEFAULT_BANNER,
          creator: DEFAULT_TWITTER_CREATOR,
        },
      };

    case 'armory':
      return {
        title: 'Cyber Armory // Upgrades & Core Shop | Breakout Ball',
        description: 'Upgrade ball velocity, paddle laser width, kinetic shields, and magnet thrusters in the Breakout Ball Cyber Armory.',
        keywords: ['breakout upgrades', 'cyber armory', 'core shop', 'ball cosmetics', 'paddle upgrades', 'breakout ball'],
        canonicalUrl: '/armory',
        themeColor: '#03040c',
        openGraph: {
          title: 'Cyber Armory - Ball & Paddle Upgrades | Breakout Ball',
          description: 'Unlock quantum balls, reinforced neon paddles, and tactical core power-ups in Breakout Ball.',
          url: '/armory',
          image: DEFAULT_BANNER,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Breakout Ball Cyber Armory',
          description: 'Upgrade your loadout with custom neon balls, wide laser paddles, and kinetic enhancements.',
          image: DEFAULT_BANNER,
          creator: DEFAULT_TWITTER_CREATOR,
        },
      };

    case 'create':
      return {
        title: 'Level Studio // Design & Share Custom Breakout Levels | Breakout Ball',
        description: 'Design, test, and publish custom cyberpunk breakout levels with quantum portals, titanium barriers, EMP shockwaves, and crystal matrices.',
        keywords: ['level designer', 'level editor', 'create breakout levels', 'custom arcade games', 'level studio', 'breakout ball'],
        canonicalUrl: '/studio',
        themeColor: '#03040c',
        openGraph: {
          title: 'Level Studio - Create & Share Custom Stages | Breakout Ball',
          description: 'Craft your own breakout levels with intuitive visual tools and share them with the global community.',
          url: '/studio',
          image: DEFAULT_BANNER,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Breakout Ball Level Studio',
          description: 'Design, test, and publish custom cyberpunk breakout levels directly in your browser.',
          image: DEFAULT_BANNER,
          creator: DEFAULT_TWITTER_CREATOR,
        },
      };

    case 'profile':
      return {
        title: 'Pilot Profile // Stats & Achievements | Breakout Ball',
        description: 'View your pilot clearance rank, stars collected, campaign cores, and unlocked cyberpunk achievements in Breakout Ball.',
        keywords: ['pilot profile', 'player stats', 'achievements', 'breakout ranking', 'breakout ball'],
        canonicalUrl: '/profile',
        themeColor: '#03040c',
        openGraph: {
          title: 'Pilot Profile - Player Stats & Achievements | Breakout Ball',
          description: 'Inspect player clearance, star mastery, and live leaderboards in Breakout Ball.',
          url: '/profile',
          image: DEFAULT_BANNER,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Breakout Ball Pilot Profile',
          description: 'Track your career stats, stars, and unlocked achievements in Breakout Ball.',
          image: DEFAULT_BANNER,
          creator: DEFAULT_TWITTER_CREATOR,
        },
      };

    case 'local':
    default:
      return {
        title: 'Breakout Ball // Cyberpunk Neon Arcade',
        description: 'Next-generation cyberpunk breakout ball arcade game featuring 100 campaign levels across 10 sectors, route firewalls, community level studio, global arena, and live leaderboards.',
        keywords: ['breakout', 'arcade', 'breakout ball', 'cyberpunk', 'neon', 'brick breaker', 'retro arcade', 'level editor', 'arena'],
        canonicalUrl: '/',
        themeColor: '#03040c',
        openGraph: {
          title: 'Breakout Ball // Cyberpunk Neon Arcade',
          description: 'Shatter plasma cores, breach route firewalls, and conquer custom community levels in Breakout Ball.',
          url: '/',
          image: DEFAULT_BANNER,
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Breakout Ball // Cyberpunk Neon Arcade',
          description: 'Shatter plasma cores, breach route firewalls, and conquer custom community levels in Breakout Ball.',
          image: DEFAULT_BANNER,
          creator: DEFAULT_TWITTER_CREATOR,
        },
      };
  }
};
