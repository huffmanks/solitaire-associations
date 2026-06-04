import { createMMKV } from "react-native-mmkv";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { ANIMATION_DELAY_MS, MAX_MOVES_MAP } from "@/lib/constants";
import { useGameStore } from "@/lib/store/game";
import {
  completeTurn,
  createSnapshot,
  extractMovingCards,
  validateAndApplyFoundationMove,
  validateAndApplyTableauMove,
} from "@/lib/store/helpers";
import { loadLevelSession } from "@/lib/utils";
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
  maxMoves: MAX_MOVES_MAP[3],
  score: 0,
  isGameDealt: false,
  hasWon: false,
  hasLost: false,
  history: [],
};

export const useLevelStore = create<LevelStoreState & LevelStoreActions>()(
  persist(
    (set, get) => ({
      ...initialLevelStoreState,
      initializeLevel: ({ currentLevel, forceRefresh = false }) => {
        if (get().columns.length > 0 && !forceRefresh) {
          return;
        }

        const { level } = loadLevelSession({ currentLevel });
        const activeDifficulty = useGameStore.getState().activeDifficulty || "medium";
        const chosenLayout = level.modes[activeDifficulty];

        const initialGameState = {
          numberOfColumns: level.numberOfColumns,
          numberOfCategories: level.numberOfCategories,
          columns: chosenLayout.columns.map((col) => col.map((card) => ({ ...card }))),
          deck: chosenLayout.deck.map((card) => ({ ...card })),
          waste: [],
        };

        const maxMoves = MAX_MOVES_MAP[initialGameState.numberOfColumns];

        set({
          isGameDealt: false,
          movesCount: 0,
          score: 0,
          hasWon: false,
          hasLost: false,
          history: [],
          selectedCardInfo: null,
          completedCategories: [],
          ...initialGameState,
          foundation: Array.from({ length: initialGameState.numberOfColumns }, () => null),
          maxMoves,
        });
      },
      setIsGameDealt: ({ isGameDealt }) => set({ isGameDealt }),
      setSelectedCardInfo: ({ info }) => set({ selectedCardInfo: info }),
      executeCardMove: ({ target, currentLevel }) => {
        let wasSuccessful = false;
        let completedTargetIndex: number | null = null;

        if (target.type === "foundation" && target.index >= get().numberOfColumns) {
          set({ selectedCardInfo: null });
          return false;
        }

        set((state) => {
          const workingColumns = state.columns.map((col) => [...col]);
          const workingWaste = [...state.waste];

          const { movingCardsList, sourceColumnIndex } = extractMovingCards(
            state,
            workingColumns,
            workingWaste,
            target.type
          );

          if (movingCardsList.length === 0) return { selectedCardInfo: null };

          if (movingCardsList[0].isLock) {
            return { selectedCardInfo: null };
          }

          if (target.type === "tableau") {
            const targetColumn = workingColumns[target.index];
            const targetTopCard = targetColumn[targetColumn.length - 1];
            if (targetTopCard && targetTopCard.isLock) {
              return { selectedCardInfo: null };
            }
          }

          if (target.type === "tableau" && sourceColumnIndex === target.index) {
            wasSuccessful = true;
            return { selectedCardInfo: null };
          }

          const resolution =
            target.type === "tableau"
              ? validateAndApplyTableauMove(workingColumns, target.index, movingCardsList)
              : validateAndApplyFoundationMove(
                  state.foundation,
                  target.index,
                  movingCardsList,
                  state.completedCategories
                );

          if (!resolution) return { selectedCardInfo: null };
          wasSuccessful = true;

          const snapshot = createSnapshot(state);

          if (state.selectedCardInfo?.type === "tableau" && sourceColumnIndex !== null) {
            const sourceColumn = workingColumns[sourceColumnIndex];
            sourceColumn.splice(sourceColumn.length - movingCardsList.length);
          } else if (state.selectedCardInfo?.type === "waste") {
            workingWaste.pop();
          }

          let dynamicColumns = resolution.nextColumns || workingColumns;
          let dynamicFoundation = resolution.nextFoundation || state.foundation;
          const dynamicCompleted = resolution.nextCompletedCategories || state.completedCategories;

          dynamicColumns.forEach((col) => {
            if (col.length > 0) {
              col[col.length - 1].isFaceUp = true;

              let topCard = col[col.length - 1];

              if (topCard.isKey) {
                const targetColor = topCard.lockColorId;

                for (let searchCol of dynamicColumns) {
                  const matchingLockCard = searchCol.find(
                    (c) => c.isLock && c.lockColorId === targetColor
                  );

                  if (matchingLockCard) {
                    matchingLockCard.keysCollected = (matchingLockCard.keysCollected || 0) + 1;

                    if (matchingLockCard.keysCollected >= (matchingLockCard.keysRequired || 1)) {
                      delete matchingLockCard.isLock;
                      delete matchingLockCard.keysRequired;
                      delete matchingLockCard.keysCollected;
                      delete matchingLockCard.lockColorId;
                    }
                    break;
                  }
                }

                delete topCard.isKey;
                delete topCard.lockColorId;
              }
            }
          });

          if (
            target.type === "foundation" &&
            resolution.nextFoundation &&
            resolution.nextFoundation[target.index] === null
          ) {
            completedTargetIndex = target.index;

            const existingStack = state.foundation[target.index] || [];
            const anchorMovingCard = movingCardsList.find((c) => c.type === "category");
            const wordCards = movingCardsList.filter((c) => c.type !== "category");

            const fullCompletedStack =
              existingStack.length === 0
                ? [anchorMovingCard!, ...wordCards]
                : [...existingStack, ...wordCards];

            dynamicFoundation = [...resolution.nextFoundation];
            dynamicFoundation[target.index] = fullCompletedStack;
          }

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
            currentLevel
          );
        });

        if (completedTargetIndex !== null) {
          const targetIndex = completedTargetIndex;
          setTimeout(() => {
            set((state) => {
              const cleanFoundation = [...state.foundation];
              cleanFoundation[targetIndex] = null;
              return { foundation: cleanFoundation };
            });
          }, ANIMATION_DELAY_MS.COMPLETION);
        }

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
    }
  )
);

export function resetLevelStorage() {
  useLevelStore.persist.clearStorage();
  useLevelStore.getState().reset();
  levelStorage.clearAll();
}
