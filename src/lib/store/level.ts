import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { useGameStore } from "@/lib/store/game";
import { checkWinCondition, generateInitialColumns, getLevelConfig } from "@/lib/utils";
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
  completedCategories: string[];
};

type LevelStoreActions = {
  initializeLevel: () => void;
  setSelectedCardInfo: (info: SelectedCardInfo | null) => void;
  revealCard: (colIndex: number, cardIndex: number) => void;
  moveCard: (targetColIndex: number) => void;
  moveToFoundation: (colIndex: number) => void;
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
  completedCategories: [],
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
          completedCategories: [],
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

          let movingCardsList: CardType[] = [];
          let sourceColIndex: number | null = null;

          if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.colIndex !== undefined) {
            sourceColIndex = state.selectedCardInfo.colIndex;
            const sourceCol = newColumns[sourceColIndex];

            if (sourceCol.length > 0) {
              const topCard = sourceCol[sourceCol.length - 1];
              const chainCategory = topCard.category;

              let chainStartIndex = sourceCol.length - 1;
              while (chainStartIndex > 0 && sourceCol[chainStartIndex - 1].isFaceUp && sourceCol[chainStartIndex - 1].category === chainCategory) {
                chainStartIndex--;
              }

              let rawGroup = sourceCol.slice(chainStartIndex);

              movingCardsList = rawGroup.sort((a, b) => {
                if (a.type === "category") return -1;
                if (b.type === "category") return 1;
                return 0;
              });
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            const topWaste = newWaste[newWaste.length - 1];
            if (topWaste) movingCardsList = [topWaste];
          }

          if (movingCardsList.length === 0) return { selectedCardInfo: null };

          const leadMovingCard = movingCardsList[0];
          const targetCol = newColumns[targetColIndex] || [];
          const topTargetCard = targetCol[targetCol.length - 1];

          if (topTargetCard && topTargetCard.type === "category") {
            return { selectedCardInfo: null };
          }

          const canMove = targetCol.length === 0 || topTargetCard?.category === leadMovingCard.category;
          if (!canMove) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceColIndex !== null) {
            const sourceCol = newColumns[sourceColIndex];
            sourceCol.splice(sourceCol.length - movingCardsList.length);

            if (sourceCol.length > 0) {
              sourceCol[sourceCol.length - 1] = { ...sourceCol[sourceCol.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          newColumns[targetColIndex] = [...targetCol, ...movingCardsList];

          return { columns: newColumns, waste: newWaste, selectedCardInfo: null };
        });
      },
      moveToFoundation: (targetSlotIdx) => {
        set((state) => {
          const newColumns = state.columns.map((col) => [...col]);
          const newWaste = [...state.waste];

          let movingCardsList: CardType[] = [];
          let sourceColIndex: number | null = null;

          if (state.selectedCardInfo?.type === "tableau" && state.selectedCardInfo.colIndex !== undefined) {
            sourceColIndex = state.selectedCardInfo.colIndex;
            const sourceCol = newColumns[sourceColIndex];

            if (sourceCol.length > 0) {
              const topCard = sourceCol[sourceCol.length - 1];
              const chainCategory = topCard.category;

              let chainStartIndex = sourceCol.length - 1;
              while (chainStartIndex > 0 && sourceCol[chainStartIndex - 1].isFaceUp && sourceCol[chainStartIndex - 1].category === chainCategory) {
                chainStartIndex--;
              }

              let rawGroup = sourceCol.slice(chainStartIndex);

              movingCardsList = rawGroup.sort((a, b) => {
                if (a.type === "category") return -1;
                if (b.type === "category") return 1;
                return 0;
              });
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            const topWaste = newWaste[newWaste.length - 1];
            if (topWaste) movingCardsList = [topWaste];
          }

          if (movingCardsList.length === 0) return { selectedCardInfo: null };

          const leadMovingCard = movingCardsList[0];
          const activeCategoryKeys = Object.keys(state.foundation);
          const existingCategoryAtSlot = activeCategoryKeys[targetSlotIdx];

          let updatedFoundation = { ...state.foundation };
          let moveSuccessful = false;

          if (!existingCategoryAtSlot) {
            if (leadMovingCard.type === "category") {
              updatedFoundation[leadMovingCard.category] = [...movingCardsList];
              moveSuccessful = true;
            }
          } else {
            if (leadMovingCard.category === existingCategoryAtSlot) {
              if (leadMovingCard.type !== "category") {
                updatedFoundation[existingCategoryAtSlot] = [...updatedFoundation[existingCategoryAtSlot], ...movingCardsList];
                moveSuccessful = true;
              }
            }
          }

          if (!moveSuccessful) return { selectedCardInfo: null };

          if (state.selectedCardInfo?.type === "tableau" && sourceColIndex !== null) {
            const sourceCol = newColumns[sourceColIndex];
            sourceCol.splice(sourceCol.length - movingCardsList.length);

            if (sourceCol.length > 0) {
              sourceCol[sourceCol.length - 1] = { ...sourceCol[sourceCol.length - 1], isFaceUp: true };
            }
          } else if (state.selectedCardInfo?.type === "waste") {
            newWaste.pop();
          }

          const targetCategory = leadMovingCard.category;
          const activeStack = updatedFoundation[targetCategory] || [];
          const anchorCard = activeStack.find((c) => c.type === "category");
          const totalRequired = anchorCard?.totalInCategory ?? 0;

          let updatedCompletedCategories = [...state.completedCategories];
          if (activeStack.length === totalRequired + 1) {
            delete updatedFoundation[targetCategory];
            updatedCompletedCategories.push(targetCategory);
          }

          const activeLevel = useGameStore.getState().currentLevel;
          const totalLevelCategoriesCount = getLevelConfig(activeLevel).categories.length;

          const win = checkWinCondition(updatedCompletedCategories, totalLevelCategoriesCount);
          if (win) {
            useGameStore.getState().completeCurrentLevel(250);
            setTimeout(() => get().initializeLevel(), 100);
          }

          return {
            columns: newColumns,
            waste: newWaste,
            foundation: updatedFoundation,
            completedCategories: updatedCompletedCategories,
            selectedCardInfo: null,
            hasWon: win,
          };
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
