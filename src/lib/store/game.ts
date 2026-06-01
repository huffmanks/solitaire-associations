import { createMMKV } from "react-native-mmkv";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { GameStoreActions, GameStoreState } from "@/types";

const gameStorage = createMMKV({ id: "game" });

const gameZustandStorage = createJSONStorage(() => ({
  setItem: (key, value) => gameStorage.set(key, value),
  getItem: (key) => gameStorage.getString(key) ?? null,
  removeItem: (key) => gameStorage.remove(key),
}));

const initialGameStoreState: GameStoreState = {
  currentLevel: 1,
  goldCount: 0,
  highestLevelBeaten: 0,
};

export const useGameStore = create<GameStoreState & GameStoreActions>()(
  persist(
    (set) => ({
      ...initialGameStoreState,
      setCurrentLevel: ({ nextLevel }) => set({ currentLevel: nextLevel }),
      recordLevelVictory: ({ currentLevel, score }) =>
        set((state) => {
          const isNewMilestone = currentLevel > state.highestLevelBeaten;
          return {
            goldCount: state.goldCount + score,
            highestLevelBeaten: isNewMilestone ? currentLevel : state.highestLevelBeaten,
          };
        }),
      reset: () => set(initialGameStoreState),
    }),
    {
      name: "game-store",
      storage: gameZustandStorage,
    }
  )
);

export function resetGameStorage() {
  useGameStore.persist.clearStorage();
  useGameStore.getState().reset();
  gameStorage.clearAll();
}
