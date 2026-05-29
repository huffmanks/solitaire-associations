import { CARD_COUNT_PER_COLUMN, DRAG_SNAP_GRACE, LEVEL_CONFIGS, WORD_BANK } from "@/lib/constants";
import { CardType, LayoutRect, LevelConfig, MoveCardTarget } from "@/types";

export function getLevelConfig({ currentLevel }: { currentLevel: number }): LevelConfig {
  if (LEVEL_CONFIGS[currentLevel]) {
    return LEVEL_CONFIGS[currentLevel];
  }

  const allKeys = Object.keys(LEVEL_CONFIGS);
  const cyclicLevel = ((currentLevel - 1) % allKeys.length) + 1;

  return LEVEL_CONFIGS[cyclicLevel];
}

export function generateInitialColumns({ currentLevel }: { currentLevel: number }) {
  const { columnsCount: numberOfColumns, categories: categoryNames } = getLevelConfig({ currentLevel });

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
  padding = 0,
) {
  return pointX >= rect.x - padding && pointX <= rect.x + rect.width + padding && pointY >= rect.y - padding && pointY <= rect.y + rect.height + padding;
}

export function resolveDropTarget(absoluteX: number, absoluteY: number, foundations: Array<LayoutRect | null>, tableaus: Array<LayoutRect | null>): MoveCardTarget | null {
  const validTableaus = tableaus.filter((t): t is LayoutRect => t !== null);
  const tableauTopBoundary = validTableaus.length > 0 ? validTableaus[0].y : 200;

  // Foundation slots
  if (absoluteY < tableauTopBoundary + DRAG_SNAP_GRACE.TABLEAU_BOUNDARY_TOP) {
    let bestFoundation: MoveCardTarget | null = null;
    let closestFoundationDist = Infinity;
    for (let i = 0; i < foundations.length; i++) {
      const rect = foundations[i];
      if (!rect) continue;

      const minX = rect.x - DRAG_SNAP_GRACE.FOUNDATION_PADDING_HORIZONTAL;
      const maxX = rect.x + rect.width + DRAG_SNAP_GRACE.FOUNDATION_PADDING_HORIZONTAL;
      const minY = rect.y - DRAG_SNAP_GRACE.FOUNDATION_PADDING_TOP;
      const maxY = rect.y + rect.height + DRAG_SNAP_GRACE.FOUNDATION_PADDING_BOTTOM;

      if (absoluteX >= minX && absoluteX <= maxX && absoluteY >= minY && absoluteY <= maxY) {
        const centerX = rect.x + rect.width / 2;
        const centerY = rect.y + rect.height / 2;
        const distance = Math.hypot(absoluteX - centerX, absoluteY - centerY);

        if (distance < closestFoundationDist) {
          closestFoundationDist = distance;
          bestFoundation = { type: "foundation", index: i };
        }
      }
    }
    return bestFoundation;
  }

  let bestTableau: MoveCardTarget | null = null;
  let closestTableauDist = Infinity;

  // Tableau columns
  for (let i = 0; i < tableaus.length; i++) {
    const rect = tableaus[i];
    if (!rect) continue;

    const minX = rect.x - DRAG_SNAP_GRACE.TABLEAU_PADDING_HORIZONTAL;
    const maxX = rect.x + rect.width + DRAG_SNAP_GRACE.TABLEAU_PADDING_HORIZONTAL;
    const minY = rect.y;
    const maxY = rect.y + rect.height + DRAG_SNAP_GRACE.TABLEAU_PADDING_BOTTOM;

    if (absoluteX >= minX && absoluteX <= maxX && absoluteY >= minY && absoluteY <= maxY) {
      const centerX = rect.x + rect.width / 2;
      const centerY = rect.y + rect.height / 2;
      const distance = Math.hypot(absoluteX - centerX, absoluteY - centerY);

      if (distance < closestTableauDist) {
        closestTableauDist = distance;
        bestTableau = { type: "tableau", index: i };
      }
    }
  }

  return bestTableau;
}
