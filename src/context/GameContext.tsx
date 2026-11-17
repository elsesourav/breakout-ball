import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab, GameScreen, LevelData, LocalLevelProgress, LeaderboardEntry, GameSettings, UserProfile, AlertConfig,
} from '../types/game';
import { DEFAULT_SETTINGS } from '../constants/game';
import { soundManager } from '../audio';
import { achievementManager } from '../services/achievements';
import { dbService } from '../services/db';
import { authService } from '../services/auth';
import { currencyService } from '../services/currency';
import { accountMigrationService } from '../services/accountMigration';
import { arcadeScrollService } from '../services/arcadeScroll';
import { parseCurrentRoute, getRoutePath, pushAppRoute, replaceAppRoute, scrubUrlParams } from '../services/router';
import { processLevelCompletion } from './gameCompletionHelper';
import { INITIAL_LOCAL_LEVELS } from '../constants/levels';
import { INITIAL_ONLINE_LEVELS } from '../constants/onlineLevels';

interface GameContextType {
  activeTab: ActiveTab; setActiveTab: (tab: ActiveTab) => void;
  screen: GameScreen; setScreen: (screen: GameScreen) => void;
  selectedLevel: LevelData | null; setSelectedLevel: (level: LevelData | null) => void;
  editingLevel: LevelData | null; setEditingLevel: (level: LevelData | null) => void;
  localLevels: LevelData[]; localProgress: Record<string, LocalLevelProgress>;
  onlineLevels: LevelData[]; userCreatedLevels: LevelData[];
  settings: GameSettings; updateSettings: (newSettings: Partial<GameSettings>) => void;
  user: UserProfile; updateUser: (user: Partial<UserProfile>) => void;
  leaderboards: Record<string, LeaderboardEntry[]>;
  alertConfig: AlertConfig | null; showAlert: (config: AlertConfig) => void; hideAlert: () => void;
  isAuthModalOpen: boolean; setIsAuthModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean; setIsSettingsOpen: (open: boolean) => void;
  authMode: 'signin' | 'signup'; setAuthMode: (mode: 'signin' | 'signup') => void;
  startPlayLevel: (level: LevelData) => void; openPreview: (level: LevelData) => void;
  openDesigner: () => void; openModifier: (level: LevelData) => void; closeModifier: () => void;
  saveUserLevel: (level: LevelData) => Promise<boolean>;
  deleteUserLevel: (id: string) => Promise<void>;
  updateLevelPrivacy: (id: string, isPublic: boolean) => Promise<void>;
  isInitialLoading: boolean; isOpeningLevel: boolean; loadingLeaderboardLevelId: string | null;
  logoutUser: () => Promise<void>;
  recordLevelCompletion: (levelId: string, time: number, livesRemaining?: number) => Promise<{
    rank: number; isNewBest: boolean; coresEarned?: number; isFirstClear?: boolean;
    starsEarned?: number; previousStars?: number; newBestStars?: number; totalClaimedForLevel?: number;
    maxCoresForLevel?: number; remainingCoresForLevel?: number;
  }>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const initialRoute = parseCurrentRoute();
  const [activeTab, setActiveTabState] = useState<ActiveTab>(initialRoute.tab);
  const [screen, setScreenState] = useState<GameScreen>(() => {
    if (initialRoute.type === 'play') return 'playing';
    if (initialRoute.type === 'level') return 'preview';
    return 'menu';
  });
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(() => {
    if (initialRoute.levelId) {
      const match = [...INITIAL_LOCAL_LEVELS, ...INITIAL_ONLINE_LEVELS].find((l) => l.id === initialRoute.levelId);
      if (match) return match;
    }
    const lastLevel = arcadeScrollService.getLastPlayedLevel();
    return INITIAL_LOCAL_LEVELS[lastLevel - 1] || INITIAL_LOCAL_LEVELS[0] || null;
  });
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);
  const [localLevels, setLocalLevels] = useState<LevelData[]>(() => INITIAL_LOCAL_LEVELS);
  const [onlineLevels, setOnlineLevels] = useState<LevelData[]>(() => INITIAL_ONLINE_LEVELS);
  const [userCreatedLevels, setUserCreatedLevels] = useState<LevelData[]>([]);
  const [localProgress, setLocalProgress] = useState<Record<string, LocalLevelProgress>>({});
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  const [settings, setSettings] = useState<GameSettings>(() => {
    try {
      const saved = localStorage.getItem('breakout_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch { return DEFAULT_SETTINGS; }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const authUser = authService.getCurrentUser();
    return {
      id: authUser.id, fullName: authUser.fullName || 'Anonymous', username: authUser.username || 'anonymous',
      email: authUser.email || '', avatarUrl: authUser.avatarUrl, provider: authUser.provider, isLoggedIn: authUser.isLoggedIn,
    };
  });

  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [isOpeningLevel, setIsOpeningLevel] = useState<boolean>(false);
  const [loadingLeaderboardLevelId, setLoadingLeaderboardLevelId] = useState<string | null>(null);
  const isOpeningLevelRef = useRef<boolean>(false);
  const shownMigrationAlertRef = useRef<Set<string>>(new Set());

  // Load from database on mount & synchronize initial URL route
  useEffect(() => {
    let isDisposed = false;
    const loadInitialData = async () => {
      const startTime = performance.now();
      try {
        scrubUrlParams();
        const [locals, onlines, userProgress] = await Promise.all([
          dbService.getLocalLevels(), dbService.getOnlineLevels(),
          dbService.getProgress(user.username), currencyService.load(user.username),
        ]);
        if (isDisposed) return;
        const effectiveId = user.id || authService.getEffectiveUserId();
        const userLevels = await dbService.getUserCreatedLevels(effectiveId);
        if (isDisposed) return;

        setLocalLevels(locals); setOnlineLevels(onlines);
        setLocalProgress(userProgress); setUserCreatedLevels(userLevels);

        const allLevels = [...locals, ...onlines, ...userLevels];
        const route = parseCurrentRoute();
        if (route.type === 'level' && route.levelId) {
          const found = allLevels.find((lvl) => lvl.id === route.levelId);
          if (found) {
            arcadeScrollService.setLastPlayedLevel(found.id);
            arcadeScrollService.reset();
            setSelectedLevel(found);
            const board = await dbService.getLeaderboard(found.id);
            setLeaderboards((prev) => ({ ...prev, [found.id]: board }));
            setScreenState('preview');
            setActiveTabState(!isNaN(Number(found.id)) ? 'local' : 'online');
            replaceAppRoute(`/level/${encodeURIComponent(found.id)}`);
            return;
          }
        } else if (route.type === 'play' && route.levelId) {
          const found = allLevels.find((lvl) => lvl.id === route.levelId);
          if (found) {
            arcadeScrollService.setLastPlayedLevel(found.id);
            arcadeScrollService.reset();
            setSelectedLevel(found); setScreenState('playing'); soundManager.startBgMusic();
            const isRestricted = isLevelSelfMadeOrTest(found);
            achievementManager.setRestrictedContext(isRestricted);
            if (!isRestricted) dbService.incrementPlayCount(found.id);
            replaceAppRoute(`/play/${encodeURIComponent(found.id)}`);
            return;
          }
        }
        replaceAppRoute(getRoutePath(route.tab, 'menu'));
        const lastLvl = arcadeScrollService.getLastPlayedLevel();
        let targetLevel = locals[lastLvl - 1] || locals[0] || null;
        if (!locals[lastLvl - 1]) {
          for (let i = 1; i <= locals.length; i++) {
            const p = userProgress[String(i)];
            if (p !== undefined && !p.completed) {
              targetLevel = locals[i - 1] || targetLevel;
              break;
            }
          }
        }
        if (targetLevel) {
          arcadeScrollService.setLastPlayedLevel(targetLevel.id);
        }
        setSelectedLevel(targetLevel);
      } catch (err) {
        console.error('Error during initial data load:', err);
      } finally {
        if (!isDisposed) {
          const elapsed = performance.now() - startTime;
          setTimeout(() => { if (!isDisposed) setIsInitialLoading(false); }, Math.max(0, 1500 - elapsed));
        }
      }
    };
    loadInitialData();
    return () => { isDisposed = true; };
  }, [user.username]);

  // Synchronize browser popstate navigation
  useEffect(() => {
    const handlePopState = async () => {
      scrubUrlParams();
      const route = parseCurrentRoute();
      const allLevels = [...localLevels, ...onlineLevels, ...userCreatedLevels];
      if (route.type === 'tab') {
        arcadeScrollService.reset();
        setActiveTabState(route.tab); setScreenState('menu');
      } else if (route.levelId) {
        const found = allLevels.find((lvl) => lvl.id === route.levelId);
        if (found) {
          arcadeScrollService.setLastPlayedLevel(found.id);
          arcadeScrollService.reset();
          setSelectedLevel(found);
          if (route.type === 'level') {
            const board = await dbService.getLeaderboard(found.id);
            setLeaderboards((prev) => ({ ...prev, [found.id]: board }));
            setScreenState('preview');
          } else if (route.type === 'play') {
            setScreenState('playing');
          }
        }
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [localLevels, onlineLevels, userCreatedLevels]);

  // Listen to external/OAuth auth changes & preserve anonymous progression
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange(async (authUser) => {
      if (authUser.isLoggedIn && authUser.username && authUser.username !== 'anonymous') {
        const effectiveId = authUser.id || authUser.username;
        setUser({
          id: effectiveId, fullName: authUser.fullName || authUser.username, username: authUser.username,
          email: authUser.email, avatarUrl: authUser.avatarUrl, provider: authUser.provider, isLoggedIn: true,
        });
        const summary = await accountMigrationService.migrateAnonymousDataToUser(authUser);
        const [freshProg, freshLevels] = await Promise.all([
          dbService.getProgress(authUser.username),
          dbService.getUserCreatedLevels(effectiveId),
        ]);
        setLocalProgress(freshProg);
        setUserCreatedLevels(freshLevels);

        const uKey = authUser.username.toLowerCase();
        const alertSessionKey = `breakout_migration_shown_${uKey}`;
        const alreadyShown =
          shownMigrationAlertRef.current.has(uKey) ||
          Boolean(sessionStorage.getItem(alertSessionKey));

        if (summary.migrated && summary.levelsPreserved > 0 && !alreadyShown) {
          shownMigrationAlertRef.current.add(uKey);
          sessionStorage.setItem(alertSessionKey, 'true');
          showAlert({
            title: 'PROGRESS PRESERVED',
            message: `Welcome @${authUser.username}! Your previous ${summary.levelsPreserved} stage progress and custom arenas are safely linked.`,
            singleBtn: true,
            btn1Text: 'PROCEED',
          });
        }
      }
    });
    return unsubscribe;
  }, []);

  // Sync settings with audio manager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled); soundManager.setVolume(settings.volume);
    soundManager.setMusicEnabled(settings.musicEnabled); soundManager.setSfxEnabled(settings.sfxEnabled);
    soundManager.setClickSoundEnabled(settings.clickSoundEnabled); soundManager.setVibrate(settings.vibrate);
    localStorage.setItem('breakout_settings', JSON.stringify(settings));
  }, [settings]);

  const setActiveTab = useCallback((tab: ActiveTab) => {
    soundManager.playClick('tab'); setActiveTabState(tab); setScreenState('menu');
    pushAppRoute(getRoutePath(tab, 'menu'));
  }, []);

  const setScreen = useCallback((newScreen: GameScreen) => {
    if (newScreen !== 'playing') achievementManager.setRestrictedContext(false);
    if (newScreen === 'menu') {
      arcadeScrollService.reset();
      isOpeningLevelRef.current = false; setIsOpeningLevel(false); setLoadingLeaderboardLevelId(null);
      pushAppRoute(getRoutePath(activeTab, 'menu'));
    }
    setScreenState(newScreen);
  }, [activeTab]);

  const updateSettings = (newSettings: Partial<GameSettings>) => setSettings((prev) => ({ ...prev, ...newSettings }));
  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const hideAlert = () => setAlertConfig(null);
  const openDesigner = () => { soundManager.playClick(); setScreenState('designer'); };
  const openModifier = (lvl: LevelData) => { soundManager.playClick(); setEditingLevel(lvl); };
  const closeModifier = () => { soundManager.playClick(); setEditingLevel(null); };

  const updateUser = useCallback(async (newUser: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUser };
      const effectiveId = updated.id || updated.username;
      authService.setCurrentUser({
        id: effectiveId, fullName: updated.fullName, username: updated.username,
        email: updated.email, avatarUrl: updated.avatarUrl, provider: updated.provider || 'credentials',
        isLoggedIn: updated.isLoggedIn,
      });

      if (updated.isLoggedIn && updated.username && updated.username !== 'anonymous') {
        accountMigrationService.migrateAnonymousDataToUser({
          id: effectiveId, fullName: updated.fullName, username: updated.username, email: updated.email,
          avatarUrl: updated.avatarUrl, provider: updated.provider || 'credentials', isLoggedIn: true,
        }).then(async (summary) => {
          const [freshProg, freshLevels] = await Promise.all([
            dbService.getProgress(updated.username),
            dbService.getUserCreatedLevels(effectiveId),
          ]);
          setLocalProgress(freshProg);
          setUserCreatedLevels(freshLevels);
          if (summary.migrated && summary.levelsPreserved > 0) {
            showAlert({
              title: 'PROGRESS SAVED',
              message: `Welcome @${updated.username}! Your previous stage progress and custom arenas are safely preserved.`,
              singleBtn: true,
              btn1Text: 'PROCEED',
            });
          }
        });
      } else {
        dbService.getUserCreatedLevels(effectiveId).then(setUserCreatedLevels);
      }
      return updated;
    });
  }, []);

  const logoutUser = useCallback(async () => {
    soundManager.playClick();
    arcadeScrollService.setLastPlayedLevel(1);
    arcadeScrollService.reset();
    const prevUser = user.username;
    await authService.logout();
    currencyService.reset();
    achievementManager.reset();
    dbService.clearLocalProgress(prevUser);
    setLocalProgress({ '1': { levelNumber: 1, completed: false, rank: null, bestTime: null } });
    setSelectedLevel(localLevels[0] || null);
    const anonId = authService.getAnonymousUserId();
    setUser({ id: anonId, fullName: 'Anonymous', username: 'anonymous', email: '', isLoggedIn: false });
    const anonLevels = await dbService.getUserCreatedLevels(anonId);
    setUserCreatedLevels(anonLevels);
  }, [user.username, localLevels]);

  const isLevelSelfMadeOrTest = useCallback((level: LevelData | null): boolean => {
    if (!level) return false;
    if (level.id === 'TEST' || level.id.startsWith('test_') || level.id.startsWith('test-')) return true;
    const effectiveUserId = user?.id || authService.getEffectiveUserId();
    if (level.creatorId && effectiveUserId) return level.creatorId.trim().toLowerCase() === effectiveUserId.trim().toLowerCase();
    return !!(level.creator && user?.username && level.creator.toLowerCase() !== 'anonymous' && level.creator.toLowerCase() === user.username.toLowerCase());
  }, [user?.id, user?.username]);

  const startPlayLevel = useCallback((level: LevelData) => {
    soundManager.playClick();
    arcadeScrollService.setLastPlayedLevel(level.id);
    arcadeScrollService.reset();
    setSelectedLevel(level); setScreenState('playing'); soundManager.startBgMusic();
    const isRestricted = isLevelSelfMadeOrTest(level);
    achievementManager.setRestrictedContext(isRestricted);
    if (!isRestricted) {
      dbService.incrementPlayCount(level.id);
      setOnlineLevels((prev) => prev.map((l) => (l.id === level.id ? { ...l, playCount: (l.playCount || 0) + 1 } : l)));
      setSelectedLevel((curr) => (curr && curr.id === level.id ? { ...curr, playCount: (curr.playCount || 0) + 1 } : curr));
      if (level.isPublic || isNaN(parseInt(level.id, 10))) achievementManager.unlock('arena_challenger');
    }
    pushAppRoute(getRoutePath(activeTab, 'playing', level.id));
  }, [activeTab, isLevelSelfMadeOrTest]);

  const openPreview = useCallback(async (level: LevelData) => {
    if (isOpeningLevelRef.current) return;
    isOpeningLevelRef.current = true; setIsOpeningLevel(true); soundManager.playClick();
    arcadeScrollService.setLastPlayedLevel(level.id);
    arcadeScrollService.reset();
    setSelectedLevel(level); setScreenState('preview');
    pushAppRoute(getRoutePath(activeTab, 'preview', level.id));
    setLoadingLeaderboardLevelId(level.id);
    try {
      const [board] = await Promise.all([dbService.getLeaderboard(level.id), new Promise((r) => setTimeout(r, 350))]);
      setLeaderboards((prev) => ({ ...prev, [level.id]: board }));
    } catch (err) {
      console.warn('Leaderboard fetch error:', err);
    } finally {
      setLoadingLeaderboardLevelId((curr) => (curr === level.id ? null : curr));
      isOpeningLevelRef.current = false; setIsOpeningLevel(false);
    }
  }, [activeTab]);

  const syncUserAndOnlineLevels = async () => {
    const effectiveId = user.id || authService.getEffectiveUserId();
    const [userLvls, onlines] = await Promise.all([dbService.getUserCreatedLevels(effectiveId), dbService.getOnlineLevels()]);
    setUserCreatedLevels(userLvls); setOnlineLevels(onlines);
  };

  const saveUserLevel = async (newLevel: LevelData): Promise<boolean> => {
    const effectiveId = user.id || authService.getEffectiveUserId();
    const success = await dbService.saveLevel({ ...newLevel, creatorId: newLevel.creatorId || effectiveId });
    if (success) { achievementManager.unlock('level_architect'); await syncUserAndOnlineLevels(); }
    return success;
  };

  const deleteUserLevel = async (id: string): Promise<void> => {
    const effectiveId = user.id || authService.getEffectiveUserId();
    await dbService.deleteLevel(id, effectiveId);
    await syncUserAndOnlineLevels();
    if (editingLevel?.id === id) setEditingLevel(null);
  };

  const updateLevelPrivacy = async (id: string, isPublic: boolean): Promise<void> => {
    await dbService.updateLevelPrivacy(id, isPublic); await syncUserAndOnlineLevels();
  };

  const recordLevelCompletion = useCallback(
    async (levelId: string, time: number, livesRemaining: number = 3) => {
      const isRestricted = isLevelSelfMadeOrTest(selectedLevel);
      const outcome = await processLevelCompletion(
        levelId, time, livesRemaining, user.username, onlineLevels, isRestricted,
        (lvlId, board) => setLeaderboards((prev) => ({ ...prev, [lvlId]: board }))
      );
      const levelNum = parseInt(levelId, 10);
      if (!isNaN(levelNum) && !isRestricted) {
        const nextLevelNum = Math.min(100, levelNum + 1);
        arcadeScrollService.setLastPlayedLevel(nextLevelNum);
        arcadeScrollService.reset();
        setLocalProgress((prev) => {
          const current = prev[levelId];
          const isBetter = !current?.bestTime || time < current.bestTime;
          const nextLevelId = String(levelNum + 1);
          const nextUnlocked = prev[nextLevelId] || {
            levelNumber: levelNum + 1, completed: false, rank: null, bestTime: null, stars: 0, claimedCores: 0, maxCores: outcome.maxCoresForLevel,
          };
          const updatedProgress = {
            ...prev,
            [levelId]: {
              levelNumber: levelNum, completed: true, bestTime: isBetter ? time : current.bestTime, rank: outcome.rank,
              stars: outcome.newBestStars, claimedCores: outcome.totalClaimedForLevel, maxCores: outcome.maxCoresForLevel,
            },
            [nextLevelId]: nextUnlocked,
          };
          const totalCompleted = Object.values(updatedProgress).filter((p) => p.completed).length;
          if (totalCompleted >= 10) achievementManager.unlock('campaign_10');
          if (totalCompleted >= 50) achievementManager.unlock('apex_champion');
          if (totalCompleted >= 100) achievementManager.unlock('omega_sovereign');
          dbService.saveProgress(updatedProgress, user.username);
          return updatedProgress;
        });
      }
      return outcome;
    },
    [user.username, selectedLevel, isLevelSelfMadeOrTest, onlineLevels, localLevels]
  );

  return (
    <GameContext.Provider
      value={{
        activeTab, setActiveTab, screen, setScreen,
        selectedLevel, setSelectedLevel, editingLevel, setEditingLevel,
        localLevels, localProgress, onlineLevels, userCreatedLevels,
        settings, updateSettings, user, updateUser, leaderboards,
        alertConfig, showAlert, hideAlert,
        isAuthModalOpen, setIsAuthModalOpen, isSettingsOpen, setIsSettingsOpen, authMode, setAuthMode,
        startPlayLevel, openPreview, openDesigner, openModifier, closeModifier,
        saveUserLevel, deleteUserLevel, updateLevelPrivacy,
        isInitialLoading, isOpeningLevel, loadingLeaderboardLevelId,
        logoutUser, recordLevelCompletion,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within a GameProvider');
  return context;
};
