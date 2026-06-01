export type CardType = {
  id: string;
  content: string;
  category: string;
  isFaceUp: boolean;
  type: "word" | "category";
  totalInCategory?: number;
};

export type SelectedCardInfo = {
  cardId: string;
  type: "tableau" | "waste";
  columnIndex?: number;
  cardIndex?: number;
};

export type LevelConfig = {
  columnsCount: number;
  categories: Array<string>;
};

export type CardVariant = "visible" | "hidden" | "category" | "empty" | "waste";
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
