import { LevelConfig } from "@/types";

export const CARD_COUNT_PER_COLUMN = {
  MIN: 2,
  MAX: 5,
};

export const BOARD_LAYOUT = {
  MAX_WIDTH: 480,
  COLUMN_GAP_MAP: {
    3: 20,
    4: 10,
    5: 10,
  } as Record<number, number>,
  MARGIN_INLINE_MAP: {
    3: 60,
    4: 40,
    5: 30,
  } as Record<number, number>,
};

export const CARD_COLUMN_VISIBLE_PEEK = 24;

export const MOVE_BALANCING = {
  BASE_MOVES_PER_CARD: 3,
  COLUMN_COMPLEXITY_MULTIPLIER: 0.25,
};

export const WORD_BANK: Record<string, Array<string>> = {
  Animals: ["Sheep", "Pig", "Goat", "Horse", "Monkey", "Bear"],
  Cinema: ["Western", "Drama", "Comedy", "Horror", "Popcorn", "Ticket"],
  Calendar: ["Day", "Week", "Month", "Year"],
  Burger: ["Beef", "Bun", "Sauce", "Cheese"],
  Book: ["Page", "Paper", "Cover"],
  Landmass: ["Asia", "Africa", "Europe"],
  One: ["10", "11", "12"],
  Two: ["20", "21", "22"],
  Three: ["30", "31", "32"],
};

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  1: {
    columnsCount: 3,
    categories: ["Animals", "Cinema", "Calendar", "Burger", "Book", "Landmass"],
  },
  2: {
    columnsCount: 3,
    categories: ["One", "Two", "Three"],
  },
};
