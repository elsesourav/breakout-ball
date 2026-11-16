import {
  HistoryStack,
  createEmptyGrid,
  blocksToGrid,
} from './DesignerTypes';
import { LevelData } from '../../types/game';

export interface DesignerSession {
  historyState: HistoryStack;
  levelName: string;
  isPrivate: boolean;
  editingLevelId: string | null;
  selectedTool: number;
}

let activeSession: DesignerSession | null = null;

export const getDesignerSession = (): DesignerSession => {
  if (!activeSession) {
    activeSession = {
      historyState: {
        past: [],
        present: {
          grid: createEmptyGrid(),
          pendingPortal: null,
        },
        future: [],
      },
      levelName: '',
      isPrivate: false,
      editingLevelId: null,
      selectedTool: 1,
    };
  }
  return activeSession;
};

export const updateDesignerSession = (partial: Partial<DesignerSession>): void => {
  if (!activeSession) {
    getDesignerSession();
  }
  activeSession = { ...activeSession!, ...partial };
};

export const initDesignerForNewLevel = (): void => {
  activeSession = {
    historyState: {
      past: [],
      present: {
        grid: createEmptyGrid(),
        pendingPortal: null,
      },
      future: [],
    },
    levelName: '',
    isPrivate: false,
    editingLevelId: null,
    selectedTool: 1,
  };
};

export const initDesignerForEditLevel = (level: LevelData): void => {
  activeSession = {
    historyState: {
      past: [],
      present: {
        grid: blocksToGrid(level.blocks || []),
        pendingPortal: null,
      },
      future: [],
    },
    levelName: level.name || '',
    isPrivate: !level.isPublic,
    editingLevelId: level.id,
    selectedTool: 1,
  };
};

export const clearDesignerSession = (): void => {
  activeSession = null;
};
