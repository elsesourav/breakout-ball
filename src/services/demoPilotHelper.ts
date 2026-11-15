import { AuthUser } from './auth';

/**
 * Creates and initializes the verified @demo_pilot local test environment.
 */
export function createDemoPilotUser(): AuthUser {
  const demoUser: AuthUser = {
    id: 'usr_demo_pilot',
    fullName: 'Demo Cyber Pilot',
    username: 'demo_pilot',
    email: 'demo@breakout.cyber',
    avatarUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=150',
    provider: 'credentials',
    isLoggedIn: true,
    token: `demo_jwt_${Date.now()}`,
  };

  try {
    const demoProgressKey = 'breakout_db_progress_demo_pilot';
    if (!localStorage.getItem(demoProgressKey)) {
      const demoProgress: Record<string, any> = {};
      for (let i = 1; i <= 15; i++) {
        demoProgress[String(i)] = {
          levelNumber: i,
          completed: true,
          bestTime: 18 + i * 1.4,
          rank: i <= 5 ? i : null,
          stars: i % 3 === 0 ? 2 : 3,
          claimedCores: 200 + i * 50,
          maxCores: 500,
        };
      }
      demoProgress['16'] = {
        levelNumber: 16,
        completed: false,
        rank: null,
        bestTime: null,
        stars: 0,
        claimedCores: 0,
        maxCores: 500,
      };
      localStorage.setItem(demoProgressKey, JSON.stringify(demoProgress));
    }
    localStorage.setItem('breakout_currency', '2500');
  } catch {}

  return demoUser;
}
