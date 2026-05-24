import { CARD_COUNT_PER_COLUMN, LEVEL_CONFIGS, WORD_BANK } from "@/lib/constants";
import { CardType, LevelConfig } from "@/types";

export function generateInitialColumns(level: number) {
  const { columnsCount: numberOfColumns, categories: categoryNames } = getLevelConfig(level);

  let allCards: Array<CardType> = [];

  categoryNames.forEach((cat) => {
    const words = WORD_BANK[cat] || [];
    const totalWords = words.length;

    allCards.push({
      id: `anchor-${cat}`,
      content: cat,
      category: cat,
      type: "category",
      isFaceUp: false,
      totalInCategory: totalWords,
    });

    words.forEach((word, i) => {
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

  const columnSizes: Array<number> = [];
  let hasMinCount = false;
  let hasMaxCount = false;

  for (let i = 0; i < numberOfColumns; i++) {
    const validChoices: Array<number> = [];

    for (let size = CARD_COUNT_PER_COLUMN.MIN; size <= CARD_COUNT_PER_COLUMN.MAX; size++) {
      if (size === CARD_COUNT_PER_COLUMN.MIN && hasMinCount) continue;
      if (size === CARD_COUNT_PER_COLUMN.MAX && hasMaxCount) continue;
      validChoices.push(size);
    }

    const chosenSize = validChoices[Math.floor(Math.random() * validChoices.length)];

    if (chosenSize === CARD_COUNT_PER_COLUMN.MIN) hasMinCount = true;
    if (chosenSize === CARD_COUNT_PER_COLUMN.MAX) hasMaxCount = true;

    columnSizes.push(chosenSize);
  }

  const columns: Array<Array<CardType>> = Array.from({ length: numberOfColumns }, () => []);

  let poolIndex = 0;
  for (let colIdx = 0; colIdx < numberOfColumns; colIdx++) {
    const cardsNeeded = columnSizes[colIdx];

    for (let i = 0; i < cardsNeeded; i++) {
      if (poolIndex < allCards.length) {
        columns[colIdx].push(allCards[poolIndex]);
        poolIndex++;
      }
    }
  }

  const remainingCards = allCards.slice(poolIndex);

  columns.forEach((col) => {
    if (col.length > 0) {
      col[col.length - 1].isFaceUp = true;
    }
  });

  return {
    columns,
    numberOfColumns,
    foundation: [],
    deck: remainingCards,
    waste: [],
  };
}

export function getLevelConfig(level: number): LevelConfig {
  if (LEVEL_CONFIGS[level]) {
    return LEVEL_CONFIGS[level];
  }

  const allKeys = Object.keys(LEVEL_CONFIGS);
  const cyclicLevel = ((level - 1) % allKeys.length) + 1;

  return LEVEL_CONFIGS[cyclicLevel];
}

export function checkWinCondition(completedList: Array<string>, totalLevelCategoriesCount: number): boolean {
  return completedList.length === totalLevelCategoriesCount;
}

export function isPointInside(rect: { x: number; y: number; width: number; height: number }, x: number, y: number) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}
