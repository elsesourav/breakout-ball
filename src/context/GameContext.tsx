import React, { createContext, useContext, useState, useEffect } from 'react';
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
import {
  DEFAULT_SETTINGS,
  DEFAULT_USER,
  INITIAL_LOCAL_LEVELS,
  INITIAL_ONLINE_LEVELS,
  MOCK_LEADERBOARDS,
} from '../constants/game';
import { soundManager } from '../utils/audio';

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
  authMode: 'signin' | 'signup';
  setAuthMode: (mode: 'signin' | 'signup') => void;
  startPlayLevel: (level: LevelData) => void;
  openPreview: (level: LevelData) => void;
  openDesigner: () => void;
  openModifier: (level: LevelData) => void;
  closeModifier: () => void;
  saveUserLevel: (level: LevelData) => boolean;
  deleteUserLevel: (id: string) => void;
  updateLevelPrivacy: (id: string, isPublic: boolean) => void;
  recordLevelCompletion: (levelId: string, time: number) => { rank: number; isNewBest: boolean };
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('local');
  const [screen, setScreenState] = useState<GameScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(INITIAL_LOCAL_LEVELS[0]);
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);

  const [localLevels] = useState<LevelData[]>(INITIAL_LOCAL_LEVELS);
  const [onlineLevels, setOnlineLevels] = useState<LevelData[]>(() => {
    const saved = localStorage.getItem('breakout_online_levels');
    return saved ? JSON.parse(saved) : INITIAL_ONLINE_LEVELS;
  });

  const [userCreatedLevels, setUserCreatedLevels] = useState<LevelData[]>(() => {
    const saved = localStorage.getItem('breakout_user_levels');
    return saved ? JSON.parse(saved) : [];
  });

  const [localProgress, setLocalProgress] = useState<Record<string, LocalLevelProgress>>(() => {
    const saved = localStorage.getItem('breakout_local_progress');
    if (saved) return JSON.parse(saved);
    // Level 1 is unlocked by default
    return {
      '1': { levelNumber: 1, completed: false, rank: null, bestTime: null },
    };
  });

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('breakout_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('breakout_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>(() => {
    const saved = localStorage.getItem('breakout_leaderboards');
    return saved ? JSON.parse(saved) : MOCK_LEADERBOARDS;
  });

  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Sync settings with audio manager and localStorage
  useEffect(() => {
    soundManager.setVolume(settings.volume);
    soundManager.setVibrate(settings.vibrate);
    localStorage.setItem('breakout_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('breakout_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('breakout_user_levels', JSON.stringify(userCreatedLevels));
  }, [userCreatedLevels]);

  useEffect(() => {
    localStorage.setItem('breakout_online_levels', JSON.stringify(onlineLevels));
  }, [onlineLevels]);

  useEffect(() => {
    localStorage.setItem('breakout_local_progress', JSON.stringify(localProgress));
  }, [localProgress]);

  useEffect(() => {
    localStorage.setItem('breakout_leaderboards', JSON.stringify(leaderboards));
  }, [leaderboards]);

  const setActiveTab = (tab: ActiveTab) => {
    soundManager.playClick();
    setActiveTabState(tab);
  };

  const setScreen = (newScreen: GameScreen) => {
    setScreenState(newScreen);
  };

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateUser = (newUser: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...newUser }));
  };

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
  };

  const hideAlert = () => {
    setAlertConfig(null);
  };

  const startPlayLevel = (level: LevelData) => {
    soundManager.playClick();
    setSelectedLevel(level);
    setScreen('playing');
    soundManager.startBgMusic();
  };

  const openPreview = (level: LevelData) => {
    soundManager.playClick();
    setSelectedLevel(level);
    setScreen('preview');
  };

  const openDesigner = () => {
    soundManager.playClick();
    setScreen('designer');
  };

  const openModifier = (level: LevelData) => {
    soundManager.playClick();
    setEditingLevel(level);
  };

  const closeModifier = () => {
    soundManager.playClick();
    setEditingLevel(null);
  };

  const saveUserLevel = (newLevel: LevelData): boolean => {
    const exists = userCreatedLevels.some((l) => l.id === newLevel.id);
    let updated: LevelData[];
    if (exists) {
      updated = userCreatedLevels.map((l) => (l.id === newLevel.id ? newLevel : l));
    } else {
      updated = [newLevel, ...userCreatedLevels];
    }
    setUserCreatedLevels(updated);

    // If public, add or update in onlineLevels
    if (newLevel.isPublic) {
      setOnlineLevels((prev) => {
        const filtered = prev.filter((l) => l.id !== newLevel.id);
        return [newLevel, ...filtered];
      });
    } else {
      setOnlineLevels((prev) => prev.filter((l) => l.id !== newLevel.id));
    }
    return true;
  };

  const deleteUserLevel = (id: string) => {
    setUserCreatedLevels((prev) => prev.filter((l) => l.id !== id));
    setOnlineLevels((prev) => prev.filter((l) => l.id !== id));
    if (editingLevel?.id === id) {
      setEditingLevel(null);
    }
  };

  const updateLevelPrivacy = (id: string, isPublic: boolean) => {
    const target = userCreatedLevels.find((l) => l.id === id);
    if (!target) return;
    const updated = { ...target, isPublic };
    saveUserLevel(updated);
  };

  const recordLevelCompletion = (levelId: string, time: number) => {
    let rank = 1;
    let isNewBest = false;

    // Update local progress if it's a numeric local level
    const levelNum = parseInt(levelId, 10);
    if (!isNaN(levelNum)) {
      setLocalProgress((prev) => {
        const current = prev[levelId];
        const isBetter = !current?.bestTime || time < current.bestTime;
        isNewBest = isBetter;

        const nextLevelId = String(levelNum + 1);
        const nextUnlocked = prev[nextLevelId] || {
          levelNumber: levelNum + 1,
          completed: false,
          rank: null,
          bestTime: null,
        };

        return {
          ...prev,
          [levelId]: {
            levelNumber: levelNum,
            completed: true,
            bestTime: isBetter ? time : current.bestTime,
            rank: 1,
          },
          [nextLevelId]: nextUnlocked,
        };
      });
    }

    // Update leaderboard
    setLeaderboards((prev) => {
      const existing = prev[levelId] || prev.default || [];
      const updatedList = [
        ...existing.filter((e) => e.username !== user.username),
        { rank: 0, username: user.username, time },
      ];
      updatedList.sort((a, b) => a.time - b.time);
      updatedList.forEach((item, idx) => {
        item.rank = idx + 1;
      });
      const userRankEntry = updatedList.find((e) => e.username === user.username);
      if (userRankEntry) rank = userRankEntry.rank;

      return {
        ...prev,
        [levelId]: updatedList.slice(0, 10),
      };
    });

    return { rank, isNewBest };
  };

  return (
    <GameContext.Provider
      value={{
        activeTab,
        setActiveTab,
        screen,
        setScreen,
        selectedLevel,
        setSelectedLevel,
        editingLevel,
        setEditingLevel,
        localLevels,
        localProgress,
        onlineLevels,
        userCreatedLevels,
        settings,
        updateSettings,
        user,
        updateUser,
        leaderboards,
        alertConfig,
        showAlert,
        hideAlert,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authMode,
        setAuthMode,
        startPlayLevel,
        openPreview,
        openDesigner,
        openModifier,
        closeModifier,
        saveUserLevel,
        deleteUserLevel,
        updateLevelPrivacy,
        recordLevelCompletion,
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
