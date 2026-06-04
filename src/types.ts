// Level
export type LevelDifficulty = "easy" | "medium" | "hard";
export type NumberOfColumns = 3 | 4 | 5;

export type PuzzleDataPool = Record<string, Array<string>>;

export interface ModeLayout {
  columns: CardType[][];
  deck: CardType[];
  maxMoves: number;
  status: "valid" | "failed_validation";
  validationErrors: string[];
}

export interface LevelData {
  levelNumber: number;
  numberOfColumns: NumberOfColumns;
  numberOfCategories: number;
  categories: string[];
  modes: {
    easy: ModeLayout;
    medium: ModeLayout;
    hard: ModeLayout;
  };
}

export type LevelSystemMetadata = {
  totalLevels: number;
  isCyclicFallback: boolean;
  maxUniqueLevelNumber: number;
  nextLevelNumber: number | null;
  hasMoreLevels: boolean;
};

export type LevelDataResponse = {
  levelPack: LevelData;
  metadata: LevelSystemMetadata;
};

// Card
export type CardType = {
  id: string;
  content: string;
  category: string;
  isFaceUp: boolean;
  type: "word" | "category";
  totalInCategory?: number;

  isLock?: boolean;
  isKey?: boolean;
  keysRequired?: number;
  keysCollected?: number;
  lockColorId?: LockColorId;
};

export type LockColorId = "red" | "orange" | "yellow";
export type SpacingVariant = "default" | "small" | "condensed";

export type CardVariant =
  | "visible"
  | "hidden"
  | "category"
  | "empty"
  | "waste"
  | "red"
  | "orange"
  | "yellow";

// Drag
export type MoveCardTarget = {
  type: "tableau" | "foundation";
  index: number;
};

export type TargetCandidate = {
  target: MoveCardTarget;
  score: number;
};

export type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

// LevelStore
export type LevelStoreState = {
  numberOfColumns: NumberOfColumns;
  columns: Array<Array<CardType>>;
  foundation: Array<Array<CardType> | null>;
  deck: Array<CardType>;
  waste: Array<CardType>;
  selectedCardInfo: SelectedCardInfo | null;
  completedCategories: Array<string>;
  movesCount: number;
  maxMoves: number;
  score: number;
  isGameDealt: boolean;
  hasWon: boolean;
  hasLost: boolean;
  history: Array<HistorySnapshot>;
};

export type LevelStoreActions = {
  initializeLevel: ({
    currentLevel,
    forceRefresh,
  }: {
    currentLevel: number;
    forceRefresh?: boolean;
  }) => void;
  setIsGameDealt: ({ isGameDealt }: { isGameDealt: boolean }) => void;
  setSelectedCardInfo: ({ info }: { info: SelectedCardInfo | null }) => void;
  executeCardMove: ({
    target,
    currentLevel,
  }: {
    target: MoveCardTarget;
    currentLevel: number;
  }) => boolean;
  drawCard: () => void;
  undoLastMove: () => void;

  reset: () => void;
};

export type HistorySnapshot = {
  columns: Array<Array<CardType>>;
  foundation: Array<Array<CardType> | null>;
  deck: Array<CardType>;
  waste: Array<CardType>;
  completedCategories: Array<string>;
};

export type SelectedCardInfo = {
  cardId: string;
  type: "tableau" | "waste";
  columnIndex?: number;
  cardIndex?: number;
};

// GameStore
export type GameStoreState = {
  currentLevel: number;
  goldCount: number;
  highestLevelBeaten: number;
  activeDifficulty: LevelDifficulty;
};

export type GameStoreActions = {
  recordLevelVictory: ({ currentLevel, score }: { currentLevel: number; score: number }) => void;
  setCurrentLevel: ({ nextLevel }: { nextLevel: number }) => void;
  setActiveDifficulty: ({
    nextActiveDifficulty,
  }: {
    nextActiveDifficulty: LevelDifficulty;
  }) => void;

  reset: () => void;
};
