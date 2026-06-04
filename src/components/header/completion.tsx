import FontAwesome from "@expo/vector-icons/FontAwesome";
import { StyleSheet, View } from "react-native";

import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { loadLevelSession } from "@/lib/utils";

export default function Completion() {
  const completedCategories = useLevelStore((state) => state.completedCategories);
  const currentLevel = useGameStore((state) => state.currentLevel);

  const { level } = loadLevelSession({ currentLevel });
  const totalBoxes = level.categories.length;
  const completedCount = completedCategories.length;
  return (
    <>
      {Array.from({ length: totalBoxes }).map((_, index) => {
        const isCompleted = index < completedCount;

        return (
          <View
            key={index}
            style={styles.completion}>
            {isCompleted && (
              <View style={styles.check}>
                <FontAwesome
                  name="check"
                  size={14}
                  color={theme.colors.foreground}
                />
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  completion: {
    backgroundColor: theme.colors.muted,
    borderRadius: 4,
    height: 25,
    width: 18,
  },
  check: {
    flex: 1,
    backgroundColor: theme.colors.greenLight,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
});
