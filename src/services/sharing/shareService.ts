import { LevelData } from '../../types/game';
import { cyberToast } from '../../components/common/CyberToast';
import { soundManager } from '../../audio';

export interface ShareOptions {
  title: string;
  text: string;
  url: string;
}

/**
 * Build canonical level share URL
 */
export const getLevelShareUrl = (levelId: string): string => {
  if (typeof window === 'undefined') return `/level/${encodeURIComponent(levelId)}`;
  return `${window.location.origin}/level/${encodeURIComponent(levelId)}`;
};

/**
 * Share a specific game level (via Native Share dialog or Clipboard copy fallback)
 */
export const shareLevel = async (level: LevelData): Promise<{ success: boolean; method: 'native' | 'clipboard' }> => {
  soundManager.playClick('cyber');
  const levelNum = parseInt(level.id, 10);
  const isCampaign = !isNaN(levelNum) && levelNum >= 1 && levelNum <= 100;

  const url = getLevelShareUrl(level.id);
  const title = isCampaign
    ? `Level ${level.id}: ${level.name} | Breakout Ball`
    : `${level.name} | Breakout Ball Arena`;
  const text = isCampaign
    ? `Can you beat Level ${level.id} (${level.name}) in Breakout Ball? Play free directly in browser!`
    : `Play custom community mission "${level.name}" in Breakout Ball! Instant browser play.`;

  // 1. Try Native Web Share API (Mobile / supported browsers)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      cyberToast.success('Mission shared successfully!');
      return { success: true, method: 'native' };
    } catch (err: unknown) {
      // User aborted share dialog or permission denied; fallback to clipboard
      if ((err as Error)?.name === 'AbortError') {
        return { success: false, method: 'native' };
      }
    }
  }

  // 2. Clipboard Fallback
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      cyberToast.success('Mission link copied to clipboard!');
      return { success: true, method: 'clipboard' };
    }
  } catch {
    // Clipboard failed, fallback to prompt
  }

  // 3. Fallback to prompt
  try {
    if (typeof window !== 'undefined') {
      window.prompt('Copy mission share link:', url);
      return { success: true, method: 'clipboard' };
    }
  } catch {
    // Ignore
  }

  return { success: false, method: 'clipboard' };
};

/**
 * Share a level victory
 */
export const shareVictory = async (
  levelNumber: number,
  score: number,
  stars: number
): Promise<void> => {
  soundManager.playClick('cyber');
  const starIcons = '⭐'.repeat(Math.max(1, stars));
  const url = getLevelShareUrl(String(levelNumber));
  const title = `Level ${levelNumber} Conquered with ${starIcons}! | Breakout Ball`;
  const text = `I just cleared Level ${levelNumber} with ${starIcons} and scored ${score.toLocaleString()} points in Breakout Ball! Can you beat my score?`;

  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text, url });
      cyberToast.success('Victory shared with pilots!');
      return;
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') return;
    }
  }

  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      cyberToast.success('Victory link copied to clipboard!');
    }
  } catch {
    // Ignore
  }
};

/**
 * Generate quick Twitter / X Share Intent URL
 */
export const getTwitterShareIntent = (text: string, url: string, hashtags = ['BreakoutBall', 'IndieGame']): string => {
  const params = new URLSearchParams({
    text,
    url,
    hashtags: hashtags.join(','),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
};

/**
 * Generate quick WhatsApp Share URL
 */
export const getWhatsAppShareIntent = (text: string, url: string): string => {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`;
};
