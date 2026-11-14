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
import { DEFAULT_SETTINGS, DEFAULT_USER } from '../constants/game';
import { soundManager } from '../utils/audio';
import { achievementManager } from '../services/achievements';
import { synthAudio } from '../utils/synthAudio';
import { dbService } from '../services/db';
import { authService } from '../services/auth';

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
  saveUserLevel: (level: LevelData) => Promise<boolean>;
  deleteUserLevel: (id: string) => Promise<void>;
  updateLevelPrivacy: (id: string, isPublic: boolean) => Promise<void>;
  recordLevelCompletion: (levelId: string, time: number) => Promise<{ rank: number; isNewBest: boolean }>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTabState] = useState<ActiveTab>('local');
  const [screen, setScreenState] = useState<GameScreen>('menu');
  const [selectedLevel, setSelectedLevel] = useState<LevelData | null>(null);
  const [editingLevel, setEditingLevel] = useState<LevelData | null>(null);

  const [localLevels, setLocalLevels] = useState<LevelData[]>([]);
  const [onlineLevels, setOnlineLevels] = useState<LevelData[]>([]);
  const [userCreatedLevels, setUserCreatedLevels] = useState<LevelData[]>([]);
  const [localProgress, setLocalProgress] = useState<Record<string, LocalLevelProgress>>({});
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardEntry[]>>({});

  const [settings, setSettings] = useState<GameSettings>(() => {
    const saved = localStorage.getItem('breakout_settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
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
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Load from Standard Database on mount
  useEffect(() => {
    const loadInitialData = async () => {
      const [locals, onlines, userProgress] = await Promise.all([
        dbService.getLocalLevels(),
        dbService.getOnlineLevels(),
        dbService.getProgress(user.username),
      ]);

      setLocalLevels(locals);
      setOnlineLevels(onlines);
      setLocalProgress(userProgress);
      setSelectedLevel(locals[0] || null);

      const userLevels = await dbService.getUserCreatedLevels(user.username);
      setUserCreatedLevels(userLevels);
    };

    loadInitialData();
  }, [user.username]);

  // Sync settings with audio manager
  useEffect(() => {
    soundManager.setVolume(settings.volume);
    soundManager.setVibrate(settings.vibrate);
    localStorage.setItem('breakout_settings', JSON.stringify(settings));
  }, [settings]);

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
    dbService.incrementPlayCount(level.id);
    if (level.isPublic || isNaN(parseInt(level.id, 10))) {
      achievementManager.unlock('arena_challenger');
    }
  };

  const openPreview = async (level: LevelData) => {
    soundManager.playClick();
    setSelectedLevel(level);
    const board = await dbService.getLeaderboard(level.id);
    setLeaderboards((prev) => ({ ...prev, [level.id]: board }));
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

  const saveUserLevel = async (newLevel: LevelData): Promise<boolean> => {
    const success = await dbService.saveLevel(newLevel);
    if (success) {
      achievementManager.unlock('level_architect');
      const [userLevels, onlines] = await Promise.all([
        dbService.getUserCreatedLevels(user.username),
        dbService.getOnlineLevels(),
      ]);
      setUserCreatedLevels(userLevels);
      setOnlineLevels(onlines);
    }
    return success;
  };

  const deleteUserLevel = async (id: string): Promise<void> => {
    await dbService.deleteLevel(id);
    const [userLevels, onlines] = await Promise.all([
      dbService.getUserCreatedLevels(user.username),
      dbService.getOnlineLevels(),
    ]);
    setUserCreatedLevels(userLevels);
    setOnlineLevels(onlines);
    if (editingLevel?.id === id) {
      setEditingLevel(null);
    }
  };

  const updateLevelPrivacy = async (id: string, isPublic: boolean): Promise<void> => {
    await dbService.updateLevelPrivacy(id, isPublic);
    const [userLevels, onlines] = await Promise.all([
      dbService.getUserCreatedLevels(user.username),
      dbService.getOnlineLevels(),
    ]);
    setUserCreatedLevels(userLevels);
    setOnlineLevels(onlines);
  };

  const recordLevelCompletion = async (levelId: string, time: number) => {
    const { rank, isNewBest, updatedLeaderboard } = await dbService.submitScore(
      levelId,
      user.username,
      time
    );

    setLeaderboards((prev) => ({ ...prev, [levelId]: updatedLeaderboard }));

    if (time < 30) {
      achievementManager.unlock('speed_demon');
    }

    // Update local progress for numbered progression
    const levelNum = parseInt(levelId, 10);
    if (!isNaN(levelNum)) {
      setLocalProgress((prev) => {
        const current = prev[levelId];
        const isBetter = !current?.bestTime || time < current.bestTime;
        const nextLevelId = String(levelNum + 1);
        const nextUnlocked = prev[nextLevelId] || {
          levelNumber: levelNum + 1,
          completed: false,
          rank: null,
          bestTime: null,
        };

        const updatedProgress = {
          ...prev,
          [levelId]: {
            levelNumber: levelNum,
            completed: true,
            bestTime: isBetter ? time : current.bestTime,
            rank,
          },
          [nextLevelId]: nextUnlocked,
        };

        const totalCompleted = Object.values(updatedProgress).filter((p) => p.completed).length;
        if (totalCompleted >= 10) achievementManager.unlock('campaign_10');
        if (totalCompleted >= 30) achievementManager.unlock('apex_champion');

        dbService.saveProgress(updatedProgress, user.username);
        return updatedProgress;
      });
    }

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
