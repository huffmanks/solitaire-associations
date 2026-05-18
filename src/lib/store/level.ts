import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { generateInitialColumns } from "@/lib/utils";
import { CardType, SelectedCardInfo } from "@/types";

const levelStorage = createMMKV({ id: "level" });

const levelZustandStorage: StateStorage = {
  setItem: (key, value) => levelStorage.set(key, value),
  getItem: (key) => levelStorage.getString(key) ?? null,
  removeItem: (key) => levelStorage.remove(key),
};

type LevelStoreState = {
  level: number;
  columns: CardType[][];
  foundation: Record<string, CardType[]>;
  deck: CardType[];
  waste: CardType[];
  selectedCardInfo: SelectedCardInfo | null;
  hasWon: boolean;
};

type LevelStoreActions = {
  initializeLevel: (levelNum?: number) => void;
  setSelectedCardInfo: (info: SelectedCardInfo | null) => void;
  revealCard: (colIndex: number, cardIndex: number) => void;
  moveCard: (targetColIndex: number) => void;
  moveToFoundation: (colIndex: number) => void;
  drawCard: () => void;
  moveWasteToFoundation: () => void;

  reset: () => void;
};

const initialLevelStoreState: LevelStoreState = {
  level: 1,
  columns: [],
  foundation: {},
  deck: [],
  waste: [],
  selectedCardInfo: null,
  hasWon: false,
};

export const useLevelStore = create<LevelStoreState & LevelStoreActions>()(
  persist(
    (set) => ({
      ...initialLevelStoreState,
      initializeLevel: (levelNum) => {
        set((state) => {
          const currentLevel = levelNum ?? state.level;
          const columnCount = Math.min(3 + Math.floor((currentLevel - 1) / 2), 7);
          const initialGameState = generateInitialColumns(columnCount, currentLevel);

          return {
            ...initialGameState,
            level: currentLevel,
            selectedCardInfo: null,
            hasWon: false,
          };
        });
      },

      setSelectedCardInfo: (info) => set({ selectedCardInfo: info }),
      revealCard: (colIndex, cardIndex) => {
        set((state) => {
          const newColumns = [...state.columns];
          const column = [...(newColumns[colIndex] || [])];
          const card = column[cardIndex];

          if (!card) return state;

          const isTopCard = cardIndex === column.length - 1;
          if (!isTopCard) return state;

          if (!card.isFaceUp) {
            const updatedCard = { ...card, isFaceUp: true };
            column[cardIndex] = updatedCard;
            newColumns[colIndex] = column;

            return { columns: newColumns };
          }

          return state;
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
            movingCard = sourceCol ? sourceCol[sourceCol.length - 1] : undefined;
          } else if (state.selectedCardInfo?.type === "waste") {
            movingCard = newWaste[newWaste.length - 1];
          }

          if (!movingCard) return { selectedCardInfo: null };

          const targetCol = newColumns[targetColIndex] || [];
          const topTargetCard = targetCol[targetCol.length - 1];

          const canMove = targetCol.length === 0 || topTargetCard?.category === movingCard.category;

          if (canMove) {
            if (state.selectedCardInfo?.type === "tableau" && sourceCol) {
              sourceCol.pop();
              if (sourceCol.length > 0) {
                const lastIdx = sourceCol.length - 1;
                sourceCol[lastIdx] = { ...sourceCol[lastIdx], isFaceUp: true };
              }
            } else if (state.selectedCardInfo?.type === "waste") {
              newWaste.pop();
            }

            targetCol.push(movingCard);
            newColumns[targetColIndex] = targetCol;

            return {
              columns: newColumns,
              waste: newWaste,
              selectedCardInfo: null,
            };
          }

          return { selectedCardInfo: null };
        });
      },

      moveToFoundation: (colIndex) => {
        set((state) => {
          const newColumns = [...state.columns];
          const column = [...(newColumns[colIndex] || [])];
          const card = column[column.length - 1];

          if (!card || !card.isFaceUp) return state;

          if (card.type === "category") {
            const existingFoundation = state.foundation[card.category];
            if (!existingFoundation) {
              const newFoundation = { ...state.foundation, [card.category]: [card] };
              column.pop();
              newColumns[colIndex] = column;
              return { columns: newColumns, foundation: newFoundation };
            }
          }

          if (card.type === "word") {
            const targetStack = state.foundation[card.category];
            if (targetStack) {
              const newFoundation = {
                ...state.foundation,
                [card.category]: [...targetStack, card],
              };
              column.pop();
              newColumns[colIndex] = column;
              return { columns: newColumns, foundation: newFoundation };
            }
          }

          return state;
        });
      },

      drawCard: () => {
        set((state) => {
          if (state.deck.length === 0) {
            return {
              deck: [...state.waste].reverse().map((c) => ({ ...c, isFaceUp: false })),
              waste: [],
            };
          }

          const newDeck = [...state.deck];
          const card = newDeck.pop();

          if (card) {
            return {
              deck: newDeck,
              waste: [...state.waste, { ...card, isFaceUp: true }],
            };
          }
          return state;
        });
      },

      moveWasteToFoundation: () => {
        set((state) => {
          if (state.waste.length === 0) return state;

          const card = state.waste[state.waste.length - 1];

          if (state.foundation[card.category]) {
            const newWaste = [...state.waste];
            newWaste.pop();

            return {
              waste: newWaste,
              foundation: {
                ...state.foundation,
                [card.category]: [...state.foundation[card.category], card],
              },
            };
          }
          return state;
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
