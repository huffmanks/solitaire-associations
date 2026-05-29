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

export type CardVariants = "visible" | "hidden" | "category" | "empty" | "waste";

export type MoveCardTarget = {
  type: "tableau" | "foundation";
  index: number;
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
  initializeLevel: ({ currentLevel }: { currentLevel: number }) => void;
  setSelectedCardInfo: ({ info }: { info: SelectedCardInfo | null }) => void;
  executeCardMove: ({ target, currentLevel }: { target: MoveCardTarget; currentLevel: number }) => boolean;
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
