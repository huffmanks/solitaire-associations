import { StyleSheet, View } from "react-native";

import { theme } from "@/lib/theme";

export default function Completion() {
  return <View style={styles.completion} />;
}

const styles = StyleSheet.create({
  completion: {
    backgroundColor: theme.colors.muted,
    borderRadius: 4,
    height: 25,
    width: 18,
  },
});
