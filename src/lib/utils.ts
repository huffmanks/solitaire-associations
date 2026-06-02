import { LEVEL_CONFIGS, WORD_BANK } from "@/lib/constants";
import { theme } from "@/lib/theme";
import {
  CardType,
  LayoutRect,
  LevelConfig,
  LockColorId,
  MoveCardTarget,
  TargetCandidate,
} from "@/types";

export function getLevelConfig({ currentLevel }: { currentLevel: number }): LevelConfig {
  if (LEVEL_CONFIGS[currentLevel]) {
    return LEVEL_CONFIGS[currentLevel];
  }

  const allKeys = Object.keys(LEVEL_CONFIGS);
  const cyclicLevel = ((currentLevel - 1) % allKeys.length) + 1;

  return LEVEL_CONFIGS[cyclicLevel];
}

export function getLockKeyCardColors({ lockColorId }: { lockColorId?: LockColorId }) {
  return {
    foregroundColor: lockColorId === "yellow" ? theme.colors.black : theme.colors.foreground,
    lightColor:
      lockColorId === "red"
        ? theme.colors.redLight
        : lockColorId === "orange"
          ? theme.colors.orangeLight
          : theme.colors.yellowLight,
    darkColor:
      lockColorId === "red"
        ? theme.colors.redDark
        : lockColorId === "orange"
          ? theme.colors.orangeDark
          : theme.colors.yellowDark,
    accentColor:
      lockColorId === "red"
        ? theme.colors.redButtonRim
        : lockColorId === "orange"
          ? theme.colors.orangeButtonRim
          : theme.colors.yellowButtonRim,
    borderColor:
      lockColorId === "red"
        ? theme.colors.redBorder
        : lockColorId === "orange"
          ? theme.colors.orangeBorder
          : theme.colors.yellowBorder,
  };
}

export function generateInitialColumns({ currentLevel }: { currentLevel: number }) {
  const {
    columnsCount: numberOfColumns,
    categories: categoryNames,
    locks = [],
    difficulty = "random",
  } = getLevelConfig({ currentLevel });

  const columnSizes: number[] = [];
  for (let colIdx = 0; colIdx < numberOfColumns; colIdx++) {
    columnSizes.push(4 + colIdx);
  }

  const blueprint: Array<
    Array<{
      isLock?: boolean;
      isKey?: boolean;
      lockColorId?: LockColorId;
      keysRequired?: number;
      keysCollected?: number;
    }>
  > = columnSizes.map((size) => Array.from({ length: size }, () => ({})));

  const COLOR_PALETTE: Array<LockColorId> = ["red", "orange", "yellow"];

  if (locks.length > 0) {
    locks.forEach((lockConfig, lockIndex) => {
      const assignedColor = COLOR_PALETTE[lockIndex % COLOR_PALETTE.length];

      const availableLockCols = blueprint
        .map((col, idx) => ({ col, idx }))
        .filter(({ col }) => !col.some((card) => card.isLock));

      if (availableLockCols.length > 0) {
        const chosenLockCol =
          availableLockCols[Math.floor(Math.random() * availableLockCols.length)];
        const lockColIdx = chosenLockCol.idx;
        const colLength = blueprint[lockColIdx].length;

        let allowedDepths = [1, 2, 3, 4];

        if (difficulty === "easy") {
          allowedDepths = [1, 2];
        } else if (difficulty === "medium") {
          allowedDepths = [1, 2, 3];
        }

        allowedDepths = allowedDepths.filter((d) => colLength - d >= 0);
        const chosenDepth = allowedDepths[Math.floor(Math.random() * allowedDepths.length)];
        const lockCardIdx = colLength - chosenDepth;

        blueprint[lockColIdx][lockCardIdx] = {
          isLock: true,
          lockColorId: assignedColor,
          keysRequired: lockConfig.keysRequired,
          keysCollected: 0,
        };

        let keysPlaced = 0;
        let attempts = 0;

        while (keysPlaced < lockConfig.keysRequired && attempts < 1500) {
          attempts++;

          const randomColIdx = Math.floor(Math.random() * numberOfColumns);
          if (randomColIdx === lockColIdx) continue;

          const targetCol = blueprint[randomColIdx];

          let targetCardIdx = Math.floor(Math.random() * targetCol.length);

          if (difficulty === "easy" || difficulty === "medium") {
            const upperSectionMinIndex = Math.max(0, targetCol.length - 4);
            targetCardIdx =
              Math.floor(Math.random() * (targetCol.length - upperSectionMinIndex)) +
              upperSectionMinIndex;
          }

          const targetSlot = targetCol[targetCardIdx];

          if (targetSlot.isLock || targetSlot.isKey || targetCardIdx === targetCol.length - 1)
            continue;

          const cardAbove = targetCol[targetCardIdx - 1];
          const cardBelow = targetCol[targetCardIdx + 1];

          const touchesSameKey =
            (cardAbove?.isKey && cardAbove.lockColorId === assignedColor) ||
            (cardBelow?.isKey && cardBelow.lockColorId === assignedColor);
          if (touchesSameKey) continue;

          const touchesOwnLock =
            (cardAbove?.isLock && cardAbove.lockColorId === assignedColor) ||
            (cardBelow?.isLock && cardBelow.lockColorId === assignedColor);
          if (touchesOwnLock) continue;

          let isBehindALock = false;
          for (let i = 0; i < targetCardIdx; i++) {
            if (targetCol[i].isLock) {
              isBehindALock = true;
              break;
            }
          }

          if (isBehindALock) {
            if (difficulty === "easy" || difficulty === "medium") continue;

            if (difficulty === "hard") {
              let keysBehindThisSpecificLock = 0;

              for (let i = 0; i <= targetCardIdx; i++) {
                if (targetCol[i].isKey) {
                  const hasLockUnderneath = targetCol.slice(0, i).some((c) => c.isLock);
                  if (hasLockUnderneath) {
                    keysBehindThisSpecificLock++;
                  }
                }
              }

              if (keysBehindThisSpecificLock >= 1) continue;
            }
          }

          blueprint[randomColIdx][targetCardIdx] = {
            isKey: true,
            lockColorId: assignedColor,
          };
          keysPlaced++;
        }
      }
    });
  }

  let categoryCards: Array<CardType> = [];
  let wordCards: Array<CardType> = [];

  categoryNames.forEach((cat) => {
    const words = WORD_BANK[cat] || [];
    const totalWords = words.length;

    categoryCards.push({
      id: `anchor-${cat}`,
      content: cat,
      category: cat,
      type: "category",
      isFaceUp: false,
      totalInCategory: totalWords,
    });

    words.forEach((word, i) => {
      wordCards.push({
        id: `${cat}-${i}`,
        content: word,
        category: cat,
        type: "word",
        isFaceUp: false,
        totalInCategory: totalWords,
      });
    });
  });

  categoryCards = categoryCards.sort(() => Math.random() - 0.5);
  wordCards = wordCards.sort(() => Math.random() - 0.5);

  let targetPercentage = 0.5;
  if (difficulty === "easy") targetPercentage = 0.75;
  if (difficulty === "medium") targetPercentage = 0.6;
  if (difficulty === "hard") targetPercentage = 0.45;

  let accessibleCategories: CardType[] = [];
  let buriedCategories: CardType[] = [];

  if (difficulty === "random") {
    wordCards = [...wordCards, ...categoryCards].sort(() => Math.random() - 0.5);
  } else {
    const splitIndex = Math.floor(categoryCards.length * targetPercentage);
    accessibleCategories = categoryCards.slice(0, splitIndex);
    buriedCategories = categoryCards.slice(splitIndex);
  }

  let generalCardPool = [...wordCards];

  if (accessibleCategories.length > 0) {
    generalCardPool = [...generalCardPool, ...accessibleCategories];
    accessibleCategories = [];
  }
  if (buriedCategories.length > 0) {
    generalCardPool = [...generalCardPool, ...buriedCategories];
    buriedCategories = [];
  }

  generalCardPool = generalCardPool.sort(() => Math.random() - 0.5);

  const columns: Array<Array<CardType>> = Array.from({ length: numberOfColumns }, () => []);

  for (let colIdx = 0; colIdx < numberOfColumns; colIdx++) {
    const colLength = columnSizes[colIdx];

    for (let cardIdx = 0; cardIdx < colLength; cardIdx++) {
      const cellBlueprint = blueprint[colIdx][cardIdx];
      const isNearTop = cardIdx >= colLength - 2;

      let chosenCard: CardType;

      if (difficulty === "random") {
        chosenCard = generalCardPool.pop()!;
      } else {
        if (isNearTop && accessibleCategories.length > 0) {
          chosenCard = accessibleCategories.pop()!;
        } else if (!isNearTop && buriedCategories.length > 0) {
          chosenCard = buriedCategories.pop()!;
        } else {
          chosenCard = generalCardPool.pop()!;
        }
      }

      columns[colIdx].push({
        ...chosenCard,
        isFaceUp: false,
        ...cellBlueprint,
      });
    }
  }

  const remainingPool = generalCardPool;

  remainingPool.forEach((card) => {
    delete card.isLock;
    delete card.isKey;
    delete card.lockColorId;
    delete card.keysRequired;
    delete card.keysCollected;
  });

  columns.forEach((col) => {
    if (col.length > 0) {
      col[col.length - 1].isFaceUp = true;
    }
  });

  return {
    columns,
    numberOfColumns,
    foundation: [],
    deck: remainingPool,
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
