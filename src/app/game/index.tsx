import { useGameStore } from "@/lib/store/game";

import GameScreen from "@/components/game";

export default function GameIndex() {
  const currentLevel = useGameStore((state) => state.currentLevel);

  return <GameScreen level={currentLevel} />;
}
