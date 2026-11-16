import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  ActiveTab,
  GameScreen,
  LevelData,
  LocalLevelProgress,
  LeaderboardEntry,
  GameSettings,
  UserProfile,
  AlertConfig,
} from '../types/game';
import { DEFAULT_SETTINGS } from '../constants/game';
import { soundManager } from '../audio';
import { achievementManager } from '../services/achievements';
import { dbService } from '../services/db';
import { authService } from '../services/auth';
import { currencyService } from '../services/currency';
import {
  parseCurrentRoute,
  getRoutePath,
  pushAppRoute,
  replaceAppRoute,
  scrubUrlParams,
} from '../services/router';
import { processLevelCompletion } from './gameCompletionHelper';
import { INITIAL_LOCAL_LEVELS } from '../constants/levels';
import { INITIAL_ONLINE_LEVELS } from '../constants/onlineLevels';

interface GameContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  screen: GameScreen;
  setScreen: (screen: GameScreen) => void;
  selectedLevel: LevelData | null;
  setSelectedLevel: (level: LevelData | null) => void;
  editingLevel: LevelData | null;
  setEditingLevel: (level: LevelData | null) => void;
  localLevels: LevelData[];
  localProgress: Record<string, LocalLevelProgress>;
  onlineLevels: LevelData[];
  userCreatedLevels: LevelData[];
  settings: GameSettings;
  updateSettings: (newSettings: Partial<GameSettings>) => void;
  user: UserProfile;
  updateUser: (user: Partial<UserProfile>) => void;
  leaderboards: Record<string, LeaderboardEntry[]>;
  alertConfig: AlertConfig | null;
  showAlert: (config: AlertConfig) => void;
  hideAlert: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  startPlayLevel: (level: LevelData) => void;
  openPreview: (level: LevelData) => void;
  openDesigner: () => void;
  openModifier: (level: LevelData) => void;
  closeModifier: () => void;
  saveUserLevel: (level: LevelData) => Promise<boolean>;
  deleteUserLevel: (id: string) => Promise<void>;
  updateLevelPrivacy: (id: string, isPublic: boolean) => Promise<void>;
  isInitialLoading: boolean;
  isOpeningLevel: boolean;
  loadingLeaderboardLevelId: string | null;
  logoutUser: () => Promise<void>;
  recordLevelCompletion: (
    levelId: string,
    time: number,
    livesRemaining?: number
  ) => Promise<{
    rank: number;
    isNewBest: boolean;
    coresEarned?: number;
    isFirstClear?: boolean;
    starsEarned?: number;
    previousStars?: number;
    newBestStars?: number;
    totalClaimedForLevel?: number;
    maxCoresForLevel?: number;
    remainingCoresForLevel?: number;
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
      const allDefaults = [...INITIAL_LOCAL_LEVELS, ...INITIAL_ONLINE_LEVELS];
      const match = allDefaults.find((l) => l.id === initialRoute.levelId);
      if (match) return match;
    }
    return INITIAL_LOCAL_LEVELS[0] || null;
  });
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);

  const [localLevels, setLocalLevels] = useState<LevelData[]>(() => INITIAL_LOCAL_LEVELS);
  const [onlineLevels, setOnlineLevels] = useState<LevelData[]>(() => INITIAL_ONLINE_LEVELS);
  const [userCreatedLevels, setUserCreatedLevels] = useState<LevelData[]>([]);
  const [localProgress, setLocalProgress] = useState<Record<string, LocalLevelProgress>>({});
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('breakout_settings');
    if (!saved) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const authUser = authService.getCurrentUser();
    return {
      fullName: authUser.fullName || 'Anonymous',
      username: authUser.username || 'anonymous',
      email: authUser.email || '',
      avatarUrl: authUser.avatarUrl,
      provider: authUser.provider,
      isLoggedIn: authUser.isLoggedIn,
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

  // Load from database on mount & synchronize initial URL route
  useEffect(() => {
    let isDisposed = false;
    const loadInitialData = async () => {
      const startTime = performance.now();
      try {
        scrubUrlParams();
        const [locals, onlines, userProgress] = await Promise.all([
          dbService.getLocalLevels(),
          dbService.getOnlineLevels(),
          dbService.getProgress(user.username),
          currencyService.load(user.username),
        ]);

        if (isDisposed) return;

        const userLevels = await dbService.getUserCreatedLevels(user.username);
        if (isDisposed) return;

        setLocalLevels(locals);
        setOnlineLevels(onlines);
        setLocalProgress(userProgress);
        setUserCreatedLevels(userLevels);

        const allLevels = [...locals, ...onlines, ...userLevels];
        const route = parseCurrentRoute();

        if (route.type === 'level' && route.levelId) {
          const found = allLevels.find((lvl) => lvl.id === route.levelId);
          if (found) {
            setSelectedLevel(found);
            const board = await dbService.getLeaderboard(found.id);
            setLeaderboards((prev) => ({ ...prev, [found.id]: board }));
            setScreenState('preview');
            const isNumeric = !isNaN(Number(found.id));
            setActiveTabState(isNumeric ? 'local' : 'online');
            replaceAppRoute(`/level/${encodeURIComponent(found.id)}`);
            return;
          }
        } else if (route.type === 'play' && route.levelId) {
          const found = allLevels.find((lvl) => lvl.id === route.levelId);
          if (found) {
            setSelectedLevel(found);
            setScreenState('playing');
            soundManager.startBgMusic();
            dbService.incrementPlayCount(found.id);
            replaceAppRoute(`/play/${encodeURIComponent(found.id)}`);
            return;
          }
        }

        // Canonicalize tab route cleanly
        const canonicalPath = getRoutePath(route.tab, 'menu');
        replaceAppRoute(canonicalPath);
        setSelectedLevel(locals[0] || null);
      } catch (err) {
        console.error('Error during initial data load:', err);
      } finally {
        if (!isDisposed) {
          const elapsed = performance.now() - startTime;
          const minDisplay = 1500; // Minimum 1.5s so user can enjoy the loading scene
          const remaining = Math.max(0, minDisplay - elapsed);
          setTimeout(() => {
            if (!isDisposed) {
              setIsInitialLoading(false);
            }
          }, remaining);
        }
      }
    };

    loadInitialData();
    return () => {
      isDisposed = true;
    };
  }, [user.username]);

  // Synchronize browser Back / Forward (popstate) navigation
  useEffect(() => {
    const handlePopState = async () => {
      scrubUrlParams();
      const route = parseCurrentRoute();
      const allLevels = [...localLevels, ...onlineLevels, ...userCreatedLevels];

      if (route.type === 'tab') {
        setActiveTabState(route.tab);
        setScreenState('menu');
      } else if (route.type === 'level' && route.levelId) {
        const found = allLevels.find((lvl) => lvl.id === route.levelId);
        if (found) {
          setSelectedLevel(found);
          const board = await dbService.getLeaderboard(found.id);
          setLeaderboards((prev) => ({ ...prev, [found.id]: board }));
          setScreenState('preview');
        }
      } else if (route.type === 'play' && route.levelId) {
        const found = allLevels.find((lvl) => lvl.id === route.levelId);
        if (found) {
          setSelectedLevel(found);
          setScreenState('playing');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [localLevels, onlineLevels, userCreatedLevels]);

  // Sync settings with audio manager
  useEffect(() => {
    soundManager.setSoundEnabled(settings.soundEnabled);
    soundManager.setVolume(settings.volume);
    soundManager.setMusicEnabled(settings.musicEnabled);
    soundManager.setSfxEnabled(settings.sfxEnabled);
    soundManager.setClickSoundEnabled(settings.clickSoundEnabled);
    soundManager.setVibrate(settings.vibrate);
    localStorage.setItem('breakout_settings', JSON.stringify(settings));
  }, [settings]);

  const setActiveTab = useCallback(
    (tab: ActiveTab) => {
      soundManager.playClick('tab');
      setActiveTabState(tab);
      setScreenState('menu');
      pushAppRoute(getRoutePath(tab, 'menu'));
    },
    []
  );

  const setScreen = useCallback(
    (newScreen: GameScreen) => {
      if (newScreen !== 'playing') {
        achievementManager.setRestrictedContext(false);
      }
      setScreenState(newScreen);
      if (newScreen === 'menu') {
        isOpeningLevelRef.current = false;
        setIsOpeningLevel(false);
        setLoadingLeaderboardLevelId(null);
        pushAppRoute(getRoutePath(activeTab, 'menu'));
      }
    },
    [activeTab]
  );

  const updateSettings = (newSettings: Partial<GameSettings>) => setSettings((prev) => ({ ...prev, ...newSettings }));
  const showAlert = (config: AlertConfig) => setAlertConfig(config);
  const hideAlert = () => setAlertConfig(null);
  const openDesigner = () => { soundManager.playClick(); setScreenState('designer'); };
  const openModifier = (lvl: LevelData) => { soundManager.playClick(); setEditingLevel(lvl); };
  const closeModifier = () => { soundManager.playClick(); setEditingLevel(null); };

  const updateUser = (newUser: Partial<UserProfile>) => {
    setUser((prev) => {
      const updated = { ...prev, ...newUser };
      authService.setCurrentUser({
        id: updated.username,
        fullName: updated.fullName,
        username: updated.username,
        email: updated.email,
        avatarUrl: updated.avatarUrl,
        provider: updated.provider || 'credentials',
        isLoggedIn: updated.isLoggedIn,
      });
      return updated;
    });
  };

  const logoutUser = useCallback(async () => {
    soundManager.playClick();
    const prevUser = user.username;
    await authService.logout();
    currencyService.reset();
    achievementManager.reset();
    dbService.clearLocalProgress(prevUser);
    setLocalProgress({ '1': { levelNumber: 1, completed: false, rank: null, bestTime: null } });
    setUserCreatedLevels([]);
    setSelectedLevel(localLevels[0] || null);
    setUser({
      fullName: 'Anonymous',
      username: 'anonymous',
      email: '',
      avatarUrl: undefined,
      provider: undefined,
      isLoggedIn: false,
    });
  }, [user.username, localLevels]);

  const isLevelSelfMadeOrTest = useCallback(
    (level: LevelData | null): boolean => {
      if (!level) return false;
      if (level.id === 'TEST' || level.id.startsWith('test_') || level.id.startsWith('test-')) return true;
      return !!(level.creator && user?.username && level.creator.trim().toLowerCase() === user.username.trim().toLowerCase());
    },
    [user?.username]
  );

  const startPlayLevel = useCallback(
    (level: LevelData) => {
      soundManager.playClick();
      setSelectedLevel(level);
      setScreenState('playing');
      soundManager.startBgMusic();
      const isRestricted = isLevelSelfMadeOrTest(level);
      achievementManager.setRestrictedContext(isRestricted);
      if (!isRestricted) {
        dbService.incrementPlayCount(level.id);
        if (level.isPublic || isNaN(parseInt(level.id, 10))) achievementManager.unlock('arena_challenger');
      }
      pushAppRoute(getRoutePath(activeTab, 'playing', level.id));
    },
    [activeTab, isLevelSelfMadeOrTest]
  );

  const openPreview = useCallback(
    async (level: LevelData) => {
      if (isOpeningLevelRef.current) return;
      isOpeningLevelRef.current = true;
      setIsOpeningLevel(true);
      soundManager.playClick();
      setSelectedLevel(level);
      setScreenState('preview');
      pushAppRoute(getRoutePath(activeTab, 'preview', level.id));
      setLoadingLeaderboardLevelId(level.id);

      try {
        const [board] = await Promise.all([
          dbService.getLeaderboard(level.id),
          new Promise((resolve) => setTimeout(resolve, 350)),
        ]);
        setLeaderboards((prev) => ({ ...prev, [level.id]: board }));
      } catch (err) {
        console.warn('Leaderboard fetch error:', err);
      } finally {
        setLoadingLeaderboardLevelId((curr) => (curr === level.id ? null : curr));
        isOpeningLevelRef.current = false;
        setIsOpeningLevel(false);
      }
    },
    [activeTab]
  );

  const syncUserAndOnlineLevels = async (uname: string) => {
    const [userLvls, onlines] = await Promise.all([dbService.getUserCreatedLevels(uname), dbService.getOnlineLevels()]);
    setUserCreatedLevels(userLvls);
    setOnlineLevels(onlines);
  };

  const saveUserLevel = async (newLevel: LevelData): Promise<boolean> => {
    const success = await dbService.saveLevel(newLevel);
    if (success) {
      achievementManager.unlock('level_architect');
      await syncUserAndOnlineLevels(user.username);
    }
    return success;
  };

  const deleteUserLevel = async (id: string): Promise<void> => {
    await dbService.deleteLevel(id);
    await syncUserAndOnlineLevels(user.username);
    if (editingLevel?.id === id) setEditingLevel(null);
  };

  const updateLevelPrivacy = async (id: string, isPublic: boolean): Promise<void> => {
    await dbService.updateLevelPrivacy(id, isPublic);
    await syncUserAndOnlineLevels(user.username);
  };

  const recordLevelCompletion = useCallback(
    async (levelId: string, time: number, livesRemaining: number = 3) => {
      const isRestricted = isLevelSelfMadeOrTest(selectedLevel);
      const outcome = await processLevelCompletion(
        levelId,
        time,
        livesRemaining,
        user.username,
        onlineLevels,
        isRestricted,
        (lvlId, board) => setLeaderboards((prev) => ({ ...prev, [lvlId]: board }))
      );

      const levelNum = parseInt(levelId, 10);
      if (!isNaN(levelNum) && !isRestricted) {
        setLocalProgress((prev) => {
          const current = prev[levelId];
          const isBetter = !current?.bestTime || time < current.bestTime;
          const nextLevelId = String(levelNum + 1);
          const nextUnlocked = prev[nextLevelId] || {
            levelNumber: levelNum + 1,
            completed: false,
            rank: null,
            bestTime: null,
            stars: 0,
            claimedCores: 0,
            maxCores: outcome.maxCoresForLevel,
          };

          const updatedProgress = {
            ...prev,
            [levelId]: {
              levelNumber: levelNum,
              completed: true,
              bestTime: isBetter ? time : current.bestTime,
              rank: outcome.rank,
              stars: outcome.newBestStars,
              claimedCores: outcome.totalClaimedForLevel,
              maxCores: outcome.maxCoresForLevel,
            },
            [nextLevelId]: nextUnlocked,
          };

          const totalCompleted = Object.values(updatedProgress).filter((p) => p.completed).length;
          if (totalCompleted >= 10) achievementManager.unlock('campaign_10');
          if (totalCompleted >= 50) achievementManager.unlock('apex_champion');

          dbService.saveProgress(updatedProgress, user.username);
          return updatedProgress;
        });
      }

      return outcome;
    },
    [user.username, selectedLevel, isLevelSelfMadeOrTest, onlineLevels]
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
