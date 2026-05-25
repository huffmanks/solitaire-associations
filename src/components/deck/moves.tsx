import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

export default function Moves() {
  const movesCount = useLevelStore((state) => state.movesCount);
  const maxMoves = useLevelStore((state) => state.maxMoves);

  const currentMoveCount = maxMoves - movesCount;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Moves</Text>
      <Text style={styles.count}>{currentMoveCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.accent,
    padding: 15,
    borderRadius: 10,
    aspectRatio: 1 / 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  text: {
    color: theme.colors.muted,
    fontSize: 18,
    fontWeight: 500,
  },
  count: {
    color: theme.colors.muted,
    fontSize: 36,
    fontWeight: 700,
  },
});
