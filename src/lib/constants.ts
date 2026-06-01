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

export const ANIMATION_DELAY_MS = {
  COMPLETION: 900,
  SHOW_MODAL: 1200,
};

export const GAME_LAYERS = {
  BASE: 0,
  STATIC_CARD: 1,
  CARD_ACCENT_UNDER: -1,
  CARD_ACCENT_OVER: 10,
  CARD_EFFECT: 20,
  DRAGGED_STACK_BASE: 10000,
} as const;

export const INTRO_ANIMATION = {
  DECK_ORIGIN_X: 16,
  DECK_ORIGIN_Y: 40,

  BASE_PARENT_RENDER: 350,
  CARD_FLY_DURATION: 320,
  STAGGER_DELAY: 60,
} as const;

export const CARD_COLUMN_VISIBLE_PEEK = 24;

export const DRAG_SNAP_GRACE = {
  TABLEAU_BOUNDARY_TOP: 60,
  TABLEAU_PADDING_BOTTOM: 120,
  TABLEAU_PADDING_HORIZONTAL: 35,
  FOUNDATION_PADDING_TOP: 35,
  FOUNDATION_PADDING_BOTTOM: 35,
  FOUNDATION_PADDING_HORIZONTAL: 35,
};

export const MOVE_BALANCING = {
  BASE_MOVES_PER_CARD: 3,
  COLUMN_COMPLEXITY_MULTIPLIER: 0.3,
  DECK_CYCLE_MULTIPLIER: 2,
};

export const SCORING = {
  EFFICIENCY_BONUS_MULTIPLIER: 3,
  PERFORMANCE: {
    HIGH_EFFICIENCY_THRESHOLD: 0.4,
    HIGH_EFFICIENCY_MULTIPLIER: 2.0,
    MEDIUM_EFFICIENCY_THRESHOLD: 0.7,
    MEDIUM_EFFICIENCY_MULTIPLIER: 1.5,
    BASE_MULTIPLIER: 1.0,
  },
  UNDO_PENALTY: {
    BASE_MITIGATION: 1.2,
    PENALTY_PER_MISMATCH: 0.05,
    MIN_MITIGATION_FLOOR: 0.8,
  },
};

export const WORD_BANK: Record<string, Array<string>> = {
  Animals: ["Sheep", "Pig", "Goat", "Horse", "Monkey", "Bear"],
  Cinema: ["Western", "Drama", "Comedy", "Horror", "Popcorn", "Ticket"],
  Calendar: ["Day", "Week", "Month", "Year"],
  Burger: ["Beef", "Bun", "Sauce", "Cheese"],
  Book: ["Page", "Paper", "Cover"],
  Landmass: ["Asia", "Africa", "Europe"],
  One: ["10", "11"],
  Two: ["20", "21"],
  Three: ["30", "31", "32"],
};

export const LEVEL_CONFIGS: Record<number, LevelConfig> = {
  2: {
    columnsCount: 5,
    categories: ["One", "Two"],
  },
  1: {
    columnsCount: 4,
    categories: ["Animals", "Cinema", "Calendar", "Burger", "Book", "Landmass"],
  },
};
