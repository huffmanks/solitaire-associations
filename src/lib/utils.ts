import { WORD_BANK } from "@/lib/constants";
import { CardType, GameState } from "@/types";

export const generateInitialColumns = (count: number, level: number): GameState => {
  // 1. Select categories for this level (Level 1 uses 3 categories)
  const categoryNames = Object.keys(WORD_BANK).slice(0, count);
  let allCards: CardType[] = [];

  categoryNames.forEach((cat) => {
    const totalWords = WORD_BANK[cat].length;

    // Add the Anchor
    allCards.push({
      id: `anchor-${cat}`,
      content: cat,
      category: cat,
      type: "category",
      isFaceUp: false,
      totalInCategory: totalWords,
    });
    // Add the Words
    WORD_BANK[cat].forEach((word, i) => {
      allCards.push({
        id: `${cat}-${i}`,
        content: word,
        category: cat,
        type: "word",
        isFaceUp: false,
        totalInCategory: totalWords,
      });
    });
  });

  // 2. Add Keys if level > 1
  if (level > 1) {
    allCards.push({
      id: "key-1",
      content: "KEY",
      category: "System",
      type: "key",
      isFaceUp: false,
    });
  }

  allCards = allCards.sort(() => Math.random() - 0.5);

  const columns: CardType[][] = Array.from({ length: count }, () => []);

  // Distribute some cards to columns (e.g., 4 cards per column)
  const cardsPerColumn = 4;
  const cardsForTableau = allCards.slice(0, count * cardsPerColumn);
  const remainingCards = allCards.slice(count * cardsPerColumn); // Fix: Define remainingCards

  cardsForTableau.forEach((card, index) => {
    columns[index % count].push(card);
  });

  // Flip top cards
  columns.forEach((col) => {
    if (col.length > 0) col[col.length - 1].isFaceUp = true;
  });

  // 6. Add a lock to a specific column if Level > 1
  if (level > 1 && columns[0].length > 0) {
    columns[0][0].lockCount = 1; // Lock the very bottom card of first column
  }

  return {
    columns: columns,
    foundation: {},
    deck: remainingCards, // Cards not placed in columns go here
    waste: [],
    keysCollected: 0,
    level: level,
  };
};
