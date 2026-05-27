import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Button3d from "@/components/ui/button-3d";

export default function ActionBar() {
  const undoLastMove = useLevelStore((state) => state.undoLastMove);
  const canUndo = useLevelStore((state) => state.history.length > 0);

  return (
    <View style={styles.container}>
      <Button3d isDisabled={!canUndo} onPress={undoLastMove}>
        <FontAwesome6 name="reply" size={16} color={theme.colors.cardFront} />
      </Button3d>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBlockEnd: 40,
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
});
