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

export type SelectedCardInfo = {
  cardId: string;
  type: "tableau" | "waste";
  columnIndex?: number;
  cardIndex?: number;
};

export type GameDifficulty = "easy" | "medium" | "hard" | "random";

export type LevelConfig = {
  columnsCount: number;
  categories: Array<string>;
  difficulty: GameDifficulty;
  locks?: Array<{
    id: string;
    keysRequired: number;
  }>;
};

export type LockColorId = "red" | "orange" | "yellow";

export type CardVariant =
  | "visible"
  | "hidden"
  | "category"
  | "empty"
  | "waste"
  | "red"
  | "orange"
  | "yellow";
export type SpacingVariant = "default" | "small" | "condensed";

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

export type LevelStoreState = {
  numberOfColumns: number;
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

export type GameStoreState = {
  currentLevel: number;
  goldCount: number;
  highestLevelBeaten: number;
};

export type GameStoreActions = {
  recordLevelVictory: ({ currentLevel, score }: { currentLevel: number; score: number }) => void;
  setCurrentLevel: ({ nextLevel }: { nextLevel: number }) => void;

  reset: () => void;
};
