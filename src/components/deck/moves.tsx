import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";

export default function Moves() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Moves</Text>
      <Text style={styles.count}>173</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.accent,
    padding: 10,
    borderRadius: 4,
  },
  text: {
    color: theme.colors.muted,
  },
  count: {
    color: theme.colors.muted,
    fontSize: 30,
  },
});
