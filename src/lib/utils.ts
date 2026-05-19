import { WORD_BANK } from "@/lib/constants";
import { CardType } from "@/types";

export const generateInitialColumns = (count: number, level: number) => {
  const categoryNames = Object.keys(WORD_BANK).slice(0, count);
  let allCards: CardType[] = [];

  categoryNames.forEach((cat) => {
    const totalWords = WORD_BANK[cat].length;

    allCards.push({
      id: `anchor-${cat}`,
      content: cat,
      category: cat,
      type: "category",
      isFaceUp: false,
      totalInCategory: totalWords,
    });

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

  allCards = allCards.sort(() => Math.random() - 0.5);

  const columns: CardType[][] = Array.from({ length: count }, () => []);

  const cardsPerColumn = 4;
  const cardsForTableau = allCards.slice(0, count * cardsPerColumn);
  const remainingCards = allCards.slice(count * cardsPerColumn);

  cardsForTableau.forEach((card, index) => {
    columns[index % count].push(card);
  });

  columns.forEach((col) => {
    if (col.length > 0) col[col.length - 1].isFaceUp = true;
  });

  return {
    columns: columns,
    foundation: {},
    deck: remainingCards,
    waste: [],
    level: level,
  };
};
