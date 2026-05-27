import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { theme } from "@/lib/theme";

import Board from "@/components/board";
import Header from "@/components/header";
import GameOverModal from "@/components/modals/game-over";
import MenuModal from "@/components/modals/menu";

export default function Game() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <Header setIsMenuOpen={setIsMenuOpen} />
        <Board />

        <GameOverModal />
        <MenuModal isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} />
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
