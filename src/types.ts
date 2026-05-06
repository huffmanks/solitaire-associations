export type CardType = {
  id: string;
  content: string;
  category: string;
  isFaceUp: boolean;
  type: "word" | "category" | "key";
  lockCount?: number;
  totalInCategory?: number;
};

export type GameState = {
  columns: CardType[][];
  foundation: Record<string, CardType[]>;
  deck: CardType[];
  waste: CardType[];
  keysCollected: number;
  level: number;
};
