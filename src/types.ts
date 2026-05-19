export type CardType = {
  id: string;
  content: string;
  category: string;
  isFaceUp: boolean;
  type: "word" | "category";
  totalInCategory?: number;
};

export type SelectedCardInfo = {
  type: "tableau" | "waste";
  colIndex?: number;
};

export type LevelConfig = {
  columnsCount: number;
  categories: string[];
};
