export type CardType = {
  id: string;
  content: string;
  category: string;
  isFaceUp: boolean;
  type: "word" | "category" | "key"; // Added 'key' type
  lockCount?: number; // 0 = unlocked, 1-3 = requires X keys
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
