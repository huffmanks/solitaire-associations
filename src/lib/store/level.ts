import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MOVE_BALANCING } from "@/lib/constants";
import { checkWinCondition, generateInitialColumns, getLevelConfig } from "@/lib/utils";
import { CardType, SelectedCardInfo } from "@/types";

const levelStorage = createMMKV({ id: "level" });

const levelZustandStorage = createJSONStorage(() => ({
  setItem: (key, value) => levelStorage.set(key, value),
  getItem: (key) => levelStorage.getString(key) ?? null,
  removeItem: (key) => levelStorage.remove(key),
}));

type LevelStoreState = {
  numberOfColumns: number;
  columns: Array<Array<CardType>>;
  foundation: Array<Array<CardType> | null>;
  deck: Array<CardType>;
  waste: Array<CardType>;
  selectedCardInfo: SelectedCardInfo | null;
  hasWon: boolean;
  completedCategories: Array<string>;
  movesCount: number;
  maxMoves: number;
  hasLost: boolean;
};

type LevelStoreActions = {
  initializeLevel: ({ currentLevel }: { currentLevel: number }) => void;
  setSelectedCardInfo: ({ info }: { info: SelectedCardInfo | null }) => void;
  moveCard: ({ targetColumnIndex }: { targetColumnIndex: number }) => void;
  moveToFoundation: ({ targetFoundationIndex, currentLevel }: { targetFoundationIndex: number; currentLevel: number }) => void;
  drawCard: () => void;

  reset: () => void;
};

const initialLevelStoreState: LevelStoreState = {
  numberOfColumns: 3,
  columns: [],
  foundation: [],
  deck: [],
  waste: [],
  selectedCardInfo: null,
  hasWon: false,
  completedCategories: [],
  movesCount: 0,
  maxMoves: 0,
  hasLost: false,
};

export const useLevelStore = create<LevelStoreState & LevelStoreActions>()(
  persist(
    (set) => ({
      ...initialLevelStoreState,
      initializeLevel: ({ currentLevel }) => {
        const initialGameState = generateInitialColumns({ currentLevel });

        const totalCardsCount = initialGameState.columns.reduce((sum, col) => sum + col.length, 0);
        const colCount = initialGameState.numberOfColumns;

        const baseMovesThreshold = totalCardsCount * MOVE_BALANCING.BASE_MOVES_PER_CARD;
        const columnMultiplierTax = 1 + (colCount - 1) * MOVE_BALANCING.COLUMN_COMPLEXITY_MULTIPLIER;
        const computedMaxMoves = Math.floor(baseMovesThreshold * columnMultiplierTax);

        set({
          ...initialGameState,
          foundation: Array.from({ length: initialGameState.numberOfColumns }, () => null),
          selectedCardInfo: null,
          hasWon: false,
          hasLost: false,
          movesCount: 0,
          maxMoves: computedMaxMoves,
          completedCategories: [],
        });
      },
      setSelectedCardInfo: ({ info }) => set({ selectedCardInfo: info }),
      moveCard: ({ targetColumnIndex }) => {
        set((state) => {
          const newColumns = state.columns.map((col) => [...col]);
          const newWaste = [...state.waste];

          function getSameCategoryGroup(sourceColumn: CardType[], touchedIndex: number) {
            const category = sourceColumn[touchedIndex]?.category;
            let chainStartIndex = touchedIndex;

            while (chainStartIndex > 0 && sourceColumn[chainStartIndex - 1].isFaceUp && sourceColumn[chainStartIndex - 1].category === category) {
              chainStartIndex--;
            }

            return sourceColumn.slice(chainStartIndex).sort((a, b) => {
              if (a.type === "category") return -1;
              if (b.type === "category") return 1;
              return 0;
            });
          }

          function extractMovingCards() {
            let movingCardsList: CardType[] = [];
            let sourceColumnIndex: number | null = null;

            if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.columnIndex !== undefined) {
              sourceColumnIndex = state.selectedCardInfo.columnIndex;
              const sourceColumn = newColumns[sourceColumnIndex];

              if (sourceColumn.length > 0) {
                const startIndex = state.selectedCardInfo.cardIndex !== undefined ? state.selectedCardInfo.cardIndex : sourceColumn.length - 1;
                movingCardsList = getSameCategoryGroup(sourceColumn, startIndex);
              }
            } else if (state.selectedCardInfo?.type === "waste") {
              const topWaste = newWaste[newWaste.length - 1];
              if (topWaste) movingCardsList = [topWaste];
            }

            return { movingCardsList, sourceColumnIndex };
          }

          const { movingCardsList, sourceColumnIndex } = extractMovingCards();

          if (movingCardsList.length === 0) return { selectedCardInfo: null };
          if (sourceColumnIndex === targetColumnIndex) return { selectedCardInfo: null };

          const leadMovingCard = movingCardsList[0];
          const targetColumn = newColumns[targetColumnIndex] || [];
          const topTargetCard = targetColumn[targetColumn.length - 1];

          const canMove = targetColumn.length === 0 || topTargetCard?.category === leadMovingCard.category;
          if (!canMove) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceColumnIndex !== null) {
            const sourceColumn = newColumns[sourceColumnIndex];
            sourceColumn.splice(sourceColumn.length - movingCardsList.length);

            if (sourceColumn.length > 0) {
              sourceColumn[sourceColumn.length - 1] = { ...sourceColumn[sourceColumn.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          newColumns[targetColumnIndex] = [...targetColumn, ...movingCardsList];

          const nextMovesCount = state.movesCount + 1;
          const playerHasLost = nextMovesCount >= state.maxMoves;

          return { columns: newColumns, waste: newWaste, selectedCardInfo: null, movesCount: nextMovesCount, hasLost: playerHasLost };
        });
      },
      moveToFoundation: ({ targetFoundationIndex, currentLevel }) => {
        set((state) => {
          const newColumns = state.columns.map((col) => [...col]);
          const newWaste = [...state.waste];

          const updatedFoundation = state.foundation.map((slot) => (slot ? [...slot] : null));

          function getSameCategoryGroup(sourceColumn: CardType[], touchedIndex: number) {
            const category = sourceColumn[touchedIndex]?.category;
            let chainStartIndex = touchedIndex;

            while (chainStartIndex > 0 && sourceColumn[chainStartIndex - 1].isFaceUp && sourceColumn[chainStartIndex - 1].category === category) {
              chainStartIndex--;
            }

            return sourceColumn.slice(chainStartIndex).sort((a, b) => {
              if (a.type === "category") return -1;
              if (b.type === "category") return 1;
              return 0;
            });
          }

          function extractMovingCards() {
            let movingCardsList: CardType[] = [];
            let sourceColumnIndex: number | null = null;

            if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.columnIndex !== undefined) {
              sourceColumnIndex = state.selectedCardInfo.columnIndex;
              const sourceColumn = newColumns[sourceColumnIndex];

              if (sourceColumn.length > 0) {
                const startIndex = state.selectedCardInfo.cardIndex !== undefined ? state.selectedCardInfo.cardIndex : sourceColumn.length - 1;
                movingCardsList = getSameCategoryGroup(sourceColumn, startIndex);
              }
            } else if (state.selectedCardInfo?.type === "waste") {
              const topWaste = newWaste[newWaste.length - 1];
              if (topWaste) movingCardsList = [topWaste];
            }

            return { movingCardsList, sourceColumnIndex };
          }

          const { movingCardsList, sourceColumnIndex } = extractMovingCards();

          if (movingCardsList.length === 0) return { selectedCardInfo: null };

          const anchorMovingCard = movingCardsList.find((c) => c.type === "category");
          const leadMovingCard = movingCardsList[0];
          const existingStackAtSlot = updatedFoundation[targetFoundationIndex];
          let moveSuccessful = false;

          if (!existingStackAtSlot) {
            if (anchorMovingCard) {
              updatedFoundation[targetFoundationIndex] = [...movingCardsList];
              moveSuccessful = true;
            }
          } else {
            const slotAnchorCard = existingStackAtSlot.find((c) => c.type === "category");
            if (slotAnchorCard && leadMovingCard.category === slotAnchorCard.category && leadMovingCard.type !== "category") {
              updatedFoundation[targetFoundationIndex] = [...existingStackAtSlot, ...movingCardsList];
              moveSuccessful = true;
            }
          }

          if (!moveSuccessful) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceColumnIndex !== null) {
            const sourceColumn = newColumns[sourceColumnIndex];
            sourceColumn.splice(sourceColumn.length - movingCardsList.length);

            if (sourceColumn.length > 0) {
              sourceColumn[sourceColumn.length - 1] = { ...sourceColumn[sourceColumn.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          const activeStack = updatedFoundation[targetFoundationIndex] || [];
          const anchorStackCard = activeStack.find((c) => c.type === "category");
          const totalRequired = anchorStackCard?.totalInCategory ?? 0;

          let updatedCompletedCategories = [...state.completedCategories];
          if (activeStack.length === totalRequired + 1) {
            updatedFoundation[targetFoundationIndex] = null;
            if (anchorStackCard) {
              updatedCompletedCategories.push(anchorStackCard.category);
            }
          }

          const totalLevelCategoriesCount = getLevelConfig({ currentLevel }).categories.length;

          const win = checkWinCondition({ completedCategories: updatedCompletedCategories, totalLevelCategoriesCount });

          const nextMovesCount = state.movesCount + 1;
          const playerHasLost = nextMovesCount >= state.maxMoves && !win;

          return {
            columns: newColumns,
            waste: newWaste,
            foundation: updatedFoundation,
            completedCategories: updatedCompletedCategories,
            selectedCardInfo: null,
            movesCount: nextMovesCount,
            hasLost: playerHasLost,
            hasWon: win,
          };
        });
      },
      drawCard: () => {
        set((state) => {
          const nextMovesCount = state.movesCount + 1;
          const playerHasLost = nextMovesCount >= state.maxMoves;

          if (state.deck.length === 0) {
            if (state.waste.length === 0) return state;
            return {
              deck: [...state.waste].reverse().map((c) => ({ ...c, isFaceUp: false })),
              waste: [],
              selectedCardInfo: null,
              movesCount: nextMovesCount,
              hasLost: playerHasLost,
            };
          }

          const newDeck = [...state.deck];
          const card = newDeck.pop();

          if (!card) return state;

          return {
            deck: newDeck,
            waste: [...state.waste, { ...card, isFaceUp: true }],
            selectedCardInfo: null,
            movesCount: nextMovesCount,
            hasLost: playerHasLost,
          };
        });
      },

      reset: () => set(initialLevelStoreState),
    }),
    {
      name: "level-store",
      storage: levelZustandStorage,
    },
  ),
);

export function resetLevelStorage() {
  useLevelStore.persist.clearStorage();
  useLevelStore.getState().reset();
  levelStorage.clearAll();
}
