import { CARD_COUNT_PER_COLUMN, LEVEL_CONFIGS, WORD_BANK } from "@/lib/constants";
import { CardType, LayoutRect, LevelConfig, MoveCardTarget, TargetCandidate } from "@/types";

export function getLevelConfig({ currentLevel }: { currentLevel: number }): LevelConfig {
  if (LEVEL_CONFIGS[currentLevel]) {
    return LEVEL_CONFIGS[currentLevel];
  }

  const allKeys = Object.keys(LEVEL_CONFIGS);
  const cyclicLevel = ((currentLevel - 1) % allKeys.length) + 1;

  return LEVEL_CONFIGS[cyclicLevel];
}

export function generateInitialColumns({ currentLevel }: { currentLevel: number }) {
  const { columnsCount: numberOfColumns, categories: categoryNames } = getLevelConfig({
    currentLevel,
  });

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

export function isPointInside(
  rect: {
    x: number;
    y: number;
    width: number;
    height: number;
  },
  pointX: number,
  pointY: number,
  padding = 0
) {
  return (
    pointX >= rect.x - padding &&
    pointX <= rect.x + rect.width + padding &&
    pointY >= rect.y - padding &&
    pointY <= rect.y + rect.height + padding
  );
}
function scoreTarget(rect: LayoutRect, x: number, y: number, type: "foundation" | "tableau") {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;

  const dx = x - centerX;
  const dy = y - centerY;

  const distance = Math.hypot(dx, dy);
  const inside = isPointInside(rect, x, y, type === "foundation" ? 36 : 18);

  let score = 0;
  if (inside) {
    score += 1000;
  }

  score -= distance;
  if (type === "foundation") {
    score += 140;
  }

  score -= Math.abs(dx) * 0.35;
  return score;
}

export function resolveDropTarget(
  absoluteX: number,
  absoluteY: number,
  foundations: Array<LayoutRect | null>,
  tableaus: Array<LayoutRect | null>
): MoveCardTarget | null {
  const candidates: Array<TargetCandidate> = [];

  foundations.forEach((rect, index) => {
    if (!rect) return;

    candidates.push({
      target: {
        type: "foundation",
        index,
      },
      score: scoreTarget(rect, absoluteX, absoluteY, "foundation"),
    });
  });

  tableaus.forEach((rect, index) => {
    if (!rect) return;

    candidates.push({
      target: {
        type: "tableau",
        index,
      },
      score: scoreTarget(rect, absoluteX, absoluteY, "tableau"),
    });
  });

  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];

  if (!best || best.score < 0) {
    return null;
  }

  return best.target;
}
