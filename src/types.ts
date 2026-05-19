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
  colIndex?: number;
};

export type LevelConfig = {
  columnsCount: number;
  categories: string[];
};
