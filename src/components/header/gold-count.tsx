import { StyleSheet, Text, View } from "react-native";

import { useGameStore } from "@/lib/store/game";
import { theme } from "@/lib/theme";

export default function GoldCount() {
  const goldCount = useGameStore((state) => state.goldCount);
  return (
    <View style={styles.container}>
      <View style={styles.gold} />
      <Text style={styles.count}>{goldCount}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBlock: 5,
    paddingInline: 10,
    backgroundColor: theme.colors.muted,
    borderRadius: 10,
    position: "relative",
  },
  gold: {
    width: 31,
    height: 31,
    backgroundColor: theme.colors.primary,
    borderRadius: "50%",
    position: "absolute",
    top: 0,
    left: -10,
  },
  count: {
    fontSize: 16,
    color: theme.colors.foreground,
    paddingInlineStart: 15,
  },
});
