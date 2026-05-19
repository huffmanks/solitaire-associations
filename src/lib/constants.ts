import { LevelConfig } from "@/types";

export const MIN_CARD_COUNT_PER_COLUMN = 2;
export const MAX_CARD_COUNT_PER_COLUMN = 5;

export const CARD_COLUMN_VISIBLE_PEEK = 24;

export const WORD_BANK: Record<string, string[]> = {
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
