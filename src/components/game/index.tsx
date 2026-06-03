import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Board from "@/components/game/board";
import Header from "@/components/header";
import GameOverModal from "@/components/modals/game-over";
import MenuModal from "@/components/modals/menu";
import WonLevelModal from "@/components/modals/won-level";

interface GameScreenProps {
  level: number;
}

export default function GameScreen({ level }: GameScreenProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const initializeLevel = useLevelStore((state) => state.initializeLevel);
  const setCurrentLevel = useGameStore((state) => state.setCurrentLevel);

  useEffect(() => {
    initializeLevel({ currentLevel: level });
    setCurrentLevel({ nextLevel: level });
  }, [level]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header setIsMenuOpen={setIsMenuOpen} />
        <Board />

        <MenuModal
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
        />
        <GameOverModal />
        <WonLevelModal setIsMenuOpen={setIsMenuOpen} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: theme.colors.greenDark,
  },
});
