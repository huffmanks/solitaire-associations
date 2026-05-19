import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { useGameStore } from "@/lib/store/game";
import { checkWinCondition, generateInitialColumns } from "@/lib/utils";
import { CardType, SelectedCardInfo } from "@/types";

const levelStorage = createMMKV({ id: "level" });

const levelZustandStorage: StateStorage = {
  setItem: (key, value) => levelStorage.set(key, value),
  getItem: (key) => levelStorage.getString(key) ?? null,
  removeItem: (key) => levelStorage.remove(key),
};

type LevelStoreState = {
  numberOfColumns: number;
  columns: CardType[][];
  foundation: Record<string, CardType[]>;
  deck: CardType[];
  waste: CardType[];
  selectedCardInfo: SelectedCardInfo | null;
  hasWon: boolean;
};

type LevelStoreActions = {
  initializeLevel: () => void;
  setSelectedCardInfo: (info: SelectedCardInfo | null) => void;
  revealCard: (colIndex: number, cardIndex: number) => void;
  moveCard: (targetColIndex: number) => void;
  moveToFoundation: (colIndex: number) => void;
  moveWasteToFoundation: () => void;
  drawCard: () => void;

  reset: () => void;
};

const initialLevelStoreState: LevelStoreState = {
  numberOfColumns: 3,
  columns: [],
  foundation: {},
  deck: [],
  waste: [],
  selectedCardInfo: null,
  hasWon: false,
};

export const useLevelStore = create<LevelStoreState & LevelStoreActions>()(
  persist(
    (set, get) => ({
      ...initialLevelStoreState,
      initializeLevel: () => {
        const activeLevel = useGameStore.getState().currentLevel;
        const initialGameState = generateInitialColumns(activeLevel);

        set({
          ...initialGameState,
          selectedCardInfo: null,
          hasWon: false,
        });
      },
      setSelectedCardInfo: (info) => set({ selectedCardInfo: info }),
      revealCard: (colIndex, cardIndex) => {
        set((state) => {
          const newColumns = [...state.columns];
          const column = [...(newColumns[colIndex] || [])];
          const card = column[cardIndex];

          if (!card || cardIndex !== column.length - 1 || card.isFaceUp) return state;

          column[cardIndex] = { ...card, isFaceUp: true };
          newColumns[colIndex] = column;
          return { columns: newColumns };
        });
      },
      moveCard: (targetColIndex) => {
        set((state) => {
          const newColumns = state.columns.map((col) => [...col]);
          const newWaste = [...state.waste];
          let movingCard: CardType | undefined;
          let sourceCol: CardType[] | undefined;

          if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.colIndex !== undefined) {
            sourceCol = newColumns[state.selectedCardInfo.colIndex];
            movingCard = sourceCol?.[sourceCol.length - 1];
          } else if (state.selectedCardInfo?.type === "waste") {
            movingCard = newWaste[newWaste.length - 1];
          }

          if (!movingCard) return { selectedCardInfo: null };

          const targetCol = newColumns[targetColIndex] || [];
          const topTargetCard = targetCol[targetCol.length - 1];

          if (topTargetCard && topTargetCard.type === "category") {
            return { selectedCardInfo: null };
          }

          const canMove = targetCol.length === 0 || topTargetCard?.category === movingCard.category;

          if (!canMove) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceCol) {
            sourceCol.pop();
            if (sourceCol.length > 0) {
              sourceCol[sourceCol.length - 1] = { ...sourceCol[sourceCol.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          targetCol.push(movingCard);
          newColumns[targetColIndex] = targetCol;

          return { columns: newColumns, waste: newWaste, selectedCardInfo: null };
        });
      },
      moveToFoundation: (targetSlotIdx) => {
        set((state) => {
          const newColumns = state.columns.map((col) => [...col]);
          const newWaste = [...state.waste];
          let movingCard: CardType | undefined;
          let sourceCol: CardType[] | undefined;

          if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.colIndex !== undefined) {
            sourceCol = newColumns[state.selectedCardInfo.colIndex];
            movingCard = sourceCol?.[sourceCol.length - 1];
          } else if (state.selectedCardInfo?.type === "waste") {
            movingCard = newWaste[newWaste.length - 1];
          }

          if (!movingCard) return { selectedCardInfo: null };

          const activeCategoryKeys = Object.keys(state.foundation);
          const existingCategoryAtSlot = activeCategoryKeys[targetSlotIdx];

          let updatedFoundation = { ...state.foundation };
          let moveSuccessful = false;

          if (!existingCategoryAtSlot) {
            if (movingCard.type === "category") {
              updatedFoundation[movingCard.category] = [movingCard];
              moveSuccessful = true;
            }
          } else {
            if (movingCard.category === existingCategoryAtSlot && movingCard.type === "word") {
              updatedFoundation[existingCategoryAtSlot] = [...updatedFoundation[existingCategoryAtSlot], movingCard];
              moveSuccessful = true;
            }
          }

          if (!moveSuccessful) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceCol) {
            sourceCol.pop();
            if (sourceCol.length > 0) {
              sourceCol[sourceCol.length - 1] = { ...sourceCol[sourceCol.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          const win = checkWinCondition(updatedFoundation, newColumns, state.deck, newWaste);
          if (win) {
            useGameStore.getState().completeCurrentLevel(250);
            setTimeout(() => get().initializeLevel(), 100);
          }

          return {
            columns: newColumns,
            waste: newWaste,
            foundation: updatedFoundation,
            selectedCardInfo: null,
            hasWon: win,
          };
        });
      },
      moveWasteToFoundation: () => {
        set((state) => {
          if (state.waste.length === 0) return state;

          const newWaste = [...state.waste];
          const card = newWaste[newWaste.length - 1];

          if (!state.foundation[card.category]) return state;

          const updatedFoundation = {
            ...state.foundation,
            [card.category]: [...state.foundation[card.category], card],
          };
          newWaste.pop();

          const win = checkWinCondition(updatedFoundation, state.columns, state.deck, newWaste);
          if (win) {
            useGameStore.getState().completeCurrentLevel(250);
            setTimeout(() => get().initializeLevel(), 100);
          }

          return { waste: newWaste, foundation: updatedFoundation, hasWon: win };
        });
      },
      drawCard: () => {
        set((state) => {
          if (state.deck.length === 0) {
            if (state.waste.length === 0) return state;
            return {
              deck: [...state.waste].reverse().map((c) => ({ ...c, isFaceUp: false })),
              waste: [],
              selectedCardInfo: null,
            };
          }

          const newDeck = [...state.deck];
          const card = newDeck.pop();

          return card ? { deck: newDeck, waste: [...state.waste, { ...card, isFaceUp: true }], selectedCardInfo: null } : state;
        });
      },

      reset: () => set(initialLevelStoreState),
    }),
    {
      name: "level-store",
      storage: createJSONStorage(() => levelZustandStorage),
    },
  ),
);

export function resetPersistedStorage() {
  useLevelStore.persist.clearStorage();
  useLevelStore.getState().reset();
  levelStorage.clearAll();
}
