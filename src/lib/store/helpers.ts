import { SCORING } from "@/lib/constants";
import { loadLevelSession } from "@/lib/utils";
import { CardType, HistorySnapshot, LevelStoreState } from "@/types";

export function getSameCategoryGroup(
  sourceColumn: CardType[],
  touchedIndex: number,
  variant: "tableau" | "foundation"
) {
  const category = sourceColumn[touchedIndex]?.category;
  let chainStartIndex = touchedIndex;

  while (
    chainStartIndex > 0 &&
    sourceColumn[chainStartIndex - 1].isFaceUp &&
    sourceColumn[chainStartIndex - 1].category === category
  ) {
    chainStartIndex--;
  }

  const slice = sourceColumn.slice(chainStartIndex);
  const categoryCard = slice.find((c) => c.type === "category");
  const wordCards = slice.filter((c) => c.type !== "category");

  if (categoryCard) {
    return variant === "tableau" ? [...wordCards, categoryCard] : [categoryCard, ...wordCards];
  }
  return wordCards;
}

export function extractMovingCards(
  state: LevelStoreState,
  columns: CardType[][],
  waste: CardType[],
  variant: "tableau" | "foundation"
) {
  let movingCardsList: CardType[] = [];
  let sourceColumnIndex: number | null = null;

  if (
    state.selectedCardInfo?.type === "tableau" &&
    state.selectedCardInfo.columnIndex !== undefined
  ) {
    sourceColumnIndex = state.selectedCardInfo.columnIndex;
    const sourceColumn = columns[sourceColumnIndex];

    if (sourceColumn.length > 0) {
      const startIndex =
        state.selectedCardInfo.cardIndex !== undefined
          ? state.selectedCardInfo.cardIndex
          : sourceColumn.length - 1;
      movingCardsList = getSameCategoryGroup(sourceColumn, startIndex, variant);
    }
  } else if (state.selectedCardInfo?.type === "waste") {
    const topWaste = waste[waste.length - 1];
    if (topWaste) movingCardsList = [topWaste];
  }

  return { movingCardsList, sourceColumnIndex };
}

export function validateAndApplyTableauMove(
  columns: CardType[][],
  targetIndex: number,
  movingCards: CardType[]
) {
  const leadMovingCard = movingCards[0];
  const targetColumn = columns[targetIndex] || [];
  const topTargetCard = targetColumn[targetColumn.length - 1];

  const canMove =
    targetColumn.length === 0 ||
    (topTargetCard?.category === leadMovingCard.category && topTargetCard?.type !== "category");
  if (!canMove) return null;

  const nextColumns = columns.map((col, idx) =>
    idx === targetIndex ? [...targetColumn, ...movingCards] : col
  );
  return { nextColumns, nextFoundation: null, nextCompletedCategories: null };
}

export function validateAndApplyFoundationMove(
  foundation: Array<CardType[] | null>,
  targetIndex: number,
  movingCards: CardType[],
  completedCategories: string[]
) {
  const anchorMovingCard = movingCards.find((c) => c.type === "category");
  const leadMovingCard = movingCards[0];
  const existingStackAtSlot = foundation[targetIndex];
  let isMatch = false;

  const nextFoundation = foundation.map((slot) => (slot ? [...slot] : null));

  if (!existingStackAtSlot) {
    if (anchorMovingCard) {
      nextFoundation[targetIndex] = [...movingCards];
      isMatch = true;
    }
  } else {
    const slotAnchorCard = existingStackAtSlot.find((c) => c.type === "category");
    if (
      slotAnchorCard &&
      leadMovingCard.category === slotAnchorCard.category &&
      leadMovingCard.type !== "category"
    ) {
      nextFoundation[targetIndex] = [...existingStackAtSlot, ...movingCards];
      isMatch = true;
    }
  }

  if (!isMatch) return null;

  const activeStack = nextFoundation[targetIndex] || [];
  const anchorStackCard = activeStack.find((c) => c.type === "category");
  const totalRequired = anchorStackCard?.totalInCategory ?? 0;
  let nextCompletedCategories = [...completedCategories];

  if (activeStack.length === totalRequired + 1) {
    nextFoundation[targetIndex] = null;
    if (anchorStackCard) {
      nextCompletedCategories.push(anchorStackCard.category);
    }
  }

  return { nextColumns: null, nextFoundation, nextCompletedCategories };
}

export function createSnapshot(state: LevelStoreState): HistorySnapshot {
  return {
    columns: state.columns.map((col) => col.map((card) => ({ ...card }))),
    foundation: state.foundation.map((slot) => (slot ? slot.map((card) => ({ ...card })) : null)),
    deck: state.deck.map((card) => ({ ...card })),
    waste: state.waste.map((card) => ({ ...card })),
    completedCategories: [...state.completedCategories],
  };
}

export function checkWinCondition({
  completedCategories,
  numberOfCategories,
}: {
  completedCategories: Array<string>;
  numberOfCategories: number;
}): boolean {
  return completedCategories.length === numberOfCategories;
}

export function completeTurn(
  state: LevelStoreState,
  updatedState: Partial<LevelStoreState>,
  currentLevel: number
) {
  const nextMovesCount = updatedState.movesCount ?? state.movesCount;
  const nextCompletedCategories = updatedState.completedCategories ?? state.completedCategories;
  const maxMoves = state.maxMoves;

  const { levelPack } = loadLevelSession({ currentLevel });
  const isWin = checkWinCondition({
    completedCategories: nextCompletedCategories,
    numberOfCategories: levelPack.numberOfCategories,
  });

  const isLoss = !isWin && nextMovesCount >= maxMoves;

  let finalScore = 0;

  if (isWin) {
    const movesLeft = Math.max(0, maxMoves - nextMovesCount);
    const efficiencyBonus = movesLeft * SCORING.EFFICIENCY_BONUS_MULTIPLIER;

    const moveConsumptionRate = nextMovesCount / maxMoves;
    let performanceMultiplier = SCORING.PERFORMANCE.BASE_MULTIPLIER;

    if (moveConsumptionRate < SCORING.PERFORMANCE.HIGH_EFFICIENCY_THRESHOLD) {
      performanceMultiplier = SCORING.PERFORMANCE.HIGH_EFFICIENCY_MULTIPLIER;
    } else if (moveConsumptionRate < SCORING.PERFORMANCE.MEDIUM_EFFICIENCY_THRESHOLD) {
      performanceMultiplier = SCORING.PERFORMANCE.MEDIUM_EFFICIENCY_MULTIPLIER;
    }

    const historyCount = updatedState.history?.length ?? state.history.length;
    const trackingMismatch = state.movesCount - historyCount;

    const undoPenaltyMitigation = Math.max(
      SCORING.UNDO_PENALTY.MIN_MITIGATION_FLOOR,
      SCORING.UNDO_PENALTY.BASE_MITIGATION -
        trackingMismatch * SCORING.UNDO_PENALTY.PENALTY_PER_MISMATCH
    );

    const baseScoreWithBonus = currentLevel + efficiencyBonus;
    finalScore = Math.floor(baseScoreWithBonus * performanceMultiplier * undoPenaltyMitigation);
  }

  return {
    ...updatedState,
    hasWon: isWin,
    hasLost: isLoss,
    score: finalScore,
  };
}
