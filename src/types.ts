// Level
export type LevelDifficulty = "easy" | "medium" | "hard";
export type NumberOfColumns = 3 | 4 | 5;
export type MaxMoves = 72 | 132 | 196;

export type RawLevelConfig = {
  levelNumber: number;
  numberOfColumns: NumberOfColumns;
  categories: Array<string>;
  locks?: Array<{
    id: LockColorId;
    keysRequired: number;
  }>;
};

export type LockRegistry = Record<
  LockColorId,
  { needed: number; collected: number; open: boolean }
>;

export type SimState = {
  deckCycles: number;
  columns: CardType[][];
  deck: CardType[];
  waste: CardType[];
  foundations: string[];
  activeLocks: LockRegistry;
};

export type PuzzleDataPool = Record<string, Array<string>>;

export type PackDifficultyVariant = { columns: CardType[][]; deck: CardType[] };

export type PackDifficultyVariants = {
  easy: PackDifficultyVariant;
  medium: PackDifficultyVariant;
  hard: PackDifficultyVariant;
};

export type StaticLevelPack = {
  levelNumber: number;
  numberOfColumns: NumberOfColumns;
  numberOfCategories: number;
  categories: Array<string>;
  modes: PackDifficultyVariants;
};

export type LevelSystemMetadata = {
  totalLevels: number;
  isCyclicFallback: boolean;
  maxUniqueLevelNumber: number;
  nextLevelNumber: number | null;
  hasMoreLevels: boolean;
};

export type LevelDataResponse = {
  levelPack: StaticLevelPack;
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
  maxMoves: MaxMoves;
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
