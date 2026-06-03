import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { LEVEL_DIFFICULTIES } from "@/lib/constants";
import { resetGameStorage, useGameStore } from "@/lib/store/game";
import { resetLevelStorage } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { getDifficultyColors, loadLevelSession } from "@/lib/utils";

import Button3d from "@/components/ui/button-3d";

export default function Index() {
  const router = useRouter();

  const currentLevel = useGameStore((state) => state.currentLevel);
  const activeDifficulty = useGameStore((state) => state.activeDifficulty);
  const setActiveDifficulty = useGameStore((state) => state.setActiveDifficulty);

  const { metadata } = loadLevelSession({ currentLevel });

  function handleReset() {
    resetGameStorage();
    resetLevelStorage();
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.heading}>Welcome to game</Text>
        </View>

        <View style={styles.buttonGroupWrapper}>
          {LEVEL_DIFFICULTIES.map((diff) => {
            const { backgroundColor, borderColor } = getDifficultyColors({
              active: activeDifficulty,
              diff,
            });
            return (
              <View
                key={diff}
                style={styles.buttonWrapper}>
                <Button3d
                  isFullWidth
                  backgroundColor={backgroundColor}
                  borderColor={borderColor}
                  onPress={() => setActiveDifficulty({ nextActiveDifficulty: diff })}>
                  <Text style={styles.wordText}>{diff}</Text>
                </Button3d>
              </View>
            );
          })}
        </View>

        <View style={styles.buttonGroupWrapper}>
          {Array.from({ length: metadata.totalLevels + 4 }).map((_, index) => {
            const levelNumber = index + 1;
            const isCurrentLevel = levelNumber === currentLevel;
            return (
              <View
                key={levelNumber}
                style={styles.buttonWrapper}>
                <Button3d
                  isFullWidth
                  backgroundColor={isCurrentLevel ? undefined : theme.colors.black}
                  borderColor={isCurrentLevel ? undefined : theme.colors.muted}
                  onPress={() => router.push(`/game/${levelNumber}`)}>
                  <Text style={styles.levelText}>{levelNumber}</Text>
                </Button3d>
              </View>
            );
          })}
        </View>

        <View style={[styles.buttonGroupWrapper, { paddingInline: 10 }]}>
          <Button3d
            isFullWidth
            backgroundColor={theme.colors.redBorder}
            borderColor={theme.colors.redButtonRim}
            onPress={handleReset}>
            <Text style={styles.wordText}>Reset storage</Text>
          </Button3d>
        </View>
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
    marginInline: 15,
  },
  header: {
    marginBlockEnd: 40,
  },
  buttonGroupWrapper: {
    marginBlockEnd: 50,
    marginInline: 15,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 25,
    rowGap: 25,
    justifyContent: "center",
  },
  buttonWrapper: {
    width: "27%",
    alignItems: "center",
  },
  heading: {
    color: theme.colors.foreground,
    fontWeight: "700",
    fontSize: 32,
  },
  wordText: {
    color: theme.colors.foreground,
    fontWeight: "500",
    fontSize: 18,
  },
  levelText: {
    color: theme.colors.foreground,
    fontWeight: "500",
    fontSize: 24,
  },
});
