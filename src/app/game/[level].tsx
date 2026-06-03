import { useLocalSearchParams } from "expo-router";

import GameScreen from "@/components/game";

export default function GameLevel() {
  const { level } = useLocalSearchParams();

  return <GameScreen level={Number(level)} />;
}
