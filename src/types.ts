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

export type CardVariants = "visible" | "hidden" | "category" | "empty";

export type DropTargetHit = {
  type: "tableau" | "foundation";
  index: number;
};
