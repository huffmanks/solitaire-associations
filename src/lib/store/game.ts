import { createMMKV } from "react-native-mmkv";
import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

const gameStorage = createMMKV({ id: "game" });

const gameZustandStorage: StateStorage = {
  setItem: (key, value) => gameStorage.set(key, value),
  getItem: (key) => gameStorage.getString(key) ?? null,
  removeItem: (key) => gameStorage.remove(key),
};

type GameStoreState = {
  currentLevel: number;
  levelsWon: number;
};

type GameStoreActions = {
  setCurrentLevel: (currentLevel: number) => void;
  increaseLevelsWon: () => void;

  reset: () => void;
};

const initialGameStoreState: GameStoreState = {
  currentLevel: 1,
  levelsWon: 0,
};

export const useGameStore = create<GameStoreState & GameStoreActions>()(
  persist(
    (set) => ({
      ...initialGameStoreState,
      setCurrentLevel: (currentLevel) => set({ currentLevel }),
      increaseLevelsWon: () =>
        set((state) => ({
          levelsWon: state.levelsWon + 1,
        })),
      reset: () => set(initialGameStoreState),
    }),
    {
      name: "game-store",
      storage: createJSONStorage(() => gameZustandStorage),
    },
  ),
);

export function resetPersistedStorage() {
  useGameStore.persist.clearStorage();
  useGameStore.getState().reset();
  gameStorage.clearAll();
}
