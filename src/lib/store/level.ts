import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { MOVE_BALANCING } from "@/lib/constants";
import { completeTurn, createSnapshot, extractMovingCards, validateAndApplyFoundationMove, validateAndApplyTableauMove } from "@/lib/store/helpers";
import { generateInitialColumns } from "@/lib/utils";
import { LevelStoreActions, LevelStoreState } from "@/types";

const levelStorage = createMMKV({ id: "level" });

const levelZustandStorage = createJSONStorage(() => ({
  setItem: (key, value) => levelStorage.set(key, value),
  getItem: (key) => levelStorage.getString(key) ?? null,
  removeItem: (key) => levelStorage.remove(key),
}));

const initialLevelStoreState: LevelStoreState = {
  numberOfColumns: 3,
  columns: [],
  foundation: [],
  deck: [],
  waste: [],
  selectedCardInfo: null,
  completedCategories: [],
  movesCount: 0,
  maxMoves: 0,
  score: 0,
  hasWon: false,
  hasLost: false,
  history: [],
};

export const useLevelStore = create<LevelStoreState & LevelStoreActions>()(
  persist(
    (set) => ({
      ...initialLevelStoreState,
      initializeLevel: ({ currentLevel }) => {
        const initialGameState = generateInitialColumns({ currentLevel });
        const totalCardsCount = initialGameState.columns.reduce((sum, col) => sum + col.length, 0);
        const deckCardsCount = initialGameState.deck?.length || 0;
        const colCount = initialGameState.numberOfColumns;

        const tableauMoveBudget = totalCardsCount * (MOVE_BALANCING.BASE_MOVES_PER_CARD + colCount * MOVE_BALANCING.COLUMN_COMPLEXITY_MULTIPLIER);
        const deckCycleBudget = deckCardsCount * MOVE_BALANCING.DECK_CYCLE_MULTIPLIER;
        const computedMaxMoves = Math.ceil(tableauMoveBudget + deckCycleBudget);

        set({
          ...initialGameState,
          foundation: Array.from({ length: initialGameState.numberOfColumns }, () => null),
          selectedCardInfo: null,
          hasWon: false,
          hasLost: false,
          movesCount: 0,
          maxMoves: computedMaxMoves,
          completedCategories: [],
          history: [],
        });
      },
      setSelectedCardInfo: ({ info }) => set({ selectedCardInfo: info }),
      executeCardMove: ({ target, currentLevel }) => {
        let wasSuccessful = false;

        set((state) => {
          const workingColumns = state.columns.map((col) => [...col]);
          const workingWaste = [...state.waste];

          const { movingCardsList, sourceColumnIndex } = extractMovingCards(state, workingColumns, workingWaste, target.type);

          if (movingCardsList.length === 0) return { selectedCardInfo: null };

          if (target.type === "tableau" && sourceColumnIndex === target.index) {
            wasSuccessful = true;
            return { selectedCardInfo: null };
          }

          const resolution =
            target.type === "tableau"
              ? validateAndApplyTableauMove(workingColumns, target.index, movingCardsList)
              : validateAndApplyFoundationMove(state.foundation, target.index, movingCardsList, state.completedCategories);

          if (!resolution) return { selectedCardInfo: null };
          wasSuccessful = true;

          const snapshot = createSnapshot(state);

          if (state.selectedCardInfo?.type === "tableau" && sourceColumnIndex !== null) {
            const sourceColumn = workingColumns[sourceColumnIndex];
            sourceColumn.splice(sourceColumn.length - movingCardsList.length);

            if (sourceColumn.length > 0) {
              sourceColumn[sourceColumn.length - 1] = { ...sourceColumn[sourceColumn.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            workingWaste.pop();
          }

          const dynamicColumns = resolution.nextColumns || workingColumns;
          const dynamicFoundation = resolution.nextFoundation || state.foundation;
          const dynamicCompleted = resolution.nextCompletedCategories || state.completedCategories;

          return completeTurn(
            state,
            {
              columns: dynamicColumns,
              waste: workingWaste,
              foundation: dynamicFoundation,
              completedCategories: dynamicCompleted,
              selectedCardInfo: null,
              movesCount: state.movesCount + 1,
              history: [...state.history, snapshot],
            },
            currentLevel,
          );
        });

        return wasSuccessful;
      },
      drawCard: () => {
        set((state) => {
          const nextMovesCount = state.movesCount + 1;
          const playerHasLost = nextMovesCount >= state.maxMoves;

          if (state.deck.length === 0) {
            if (state.waste.length === 0) return state;

            const snapshot = createSnapshot(state);

            return {
              deck: [...state.waste].reverse().map((c) => ({ ...c, isFaceUp: false })),
              waste: [],
              selectedCardInfo: null,
              movesCount: nextMovesCount,
              hasLost: playerHasLost,
              history: [...state.history, snapshot],
            };
          }

          const newDeck = [...state.deck];
          const card = newDeck.pop();

          if (!card) return state;

          const snapshot = createSnapshot(state);

          return {
            deck: newDeck,
            waste: [...state.waste, { ...card, isFaceUp: true }],
            selectedCardInfo: null,
            movesCount: nextMovesCount,
            hasLost: playerHasLost,
            history: [...state.history, snapshot],
          };
        });
      },
      undoLastMove: () => {
        set((state) => {
          if (state.history.length === 0) return state;

          const previousHistory = [...state.history];
          const lastSnapshot = previousHistory.pop();

          if (!lastSnapshot) return state;

          const nextMovesCount = state.movesCount + 1;
          const playerHasLost = nextMovesCount >= state.maxMoves;

          return {
            ...lastSnapshot,
            movesCount: nextMovesCount,
            hasLost: playerHasLost,
            hasWon: false,
            selectedCardInfo: null,
            history: previousHistory,
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
