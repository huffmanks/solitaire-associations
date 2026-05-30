import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const gameStorage = createMMKV({ id: "game" });

const gameZustandStorage = createJSONStorage(() => ({
  setItem: (key, value) => gameStorage.set(key, value),
  getItem: (key) => gameStorage.getString(key) ?? null,
  removeItem: (key) => gameStorage.remove(key),
}));

type GameStoreState = {
  currentLevel: number;
  goldCount: number;
  levelsWon: number;
};

type GameStoreActions = {
  completeCurrentLevel: ({ score }: { score: number }) => void;

  reset: () => void;
};

const initialGameStoreState: GameStoreState = {
  currentLevel: 1,
  goldCount: 0,
  levelsWon: 0,
};

export const useGameStore = create<GameStoreState & GameStoreActions>()(
  persist(
    (set) => ({
      ...initialGameStoreState,
      completeCurrentLevel: ({ score }) =>
        set((state) => ({
          levelsWon: state.levelsWon + 1,
          currentLevel: state.currentLevel + 1,
          goldCount: state.goldCount + score,
        })),
      reset: () => set(initialGameStoreState),
    }),
    {
      name: "game-store",
      storage: gameZustandStorage,
    },
  ),
);

export function resetGameStorage() {
  useGameStore.persist.clearStorage();
  useGameStore.getState().reset();
  gameStorage.clearAll();
}
