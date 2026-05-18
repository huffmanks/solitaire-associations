import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

export default function GoldCount() {
  return (
    <View style={styles.container}>
      <View style={styles.gold} />
      <Text style={styles.count}>8276</Text>
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
