import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useShallow } from "zustand/shallow";

import { ANIMATION_DELAY_MS } from "@/lib/constants";
import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import ModalLayout from "@/components/modals/modal-layout";
import Button3d from "@/components/ui/button-3d";

interface WonLevelModalProps {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function WonLevelModal({ setIsMenuOpen }: WonLevelModalProps) {
  const router = useRouter();

  const { currentLevel, setCurrentLevel, recordLevelVictory } = useGameStore(
    useShallow((state) => ({
      currentLevel: state.currentLevel,
      setCurrentLevel: state.setCurrentLevel,
      recordLevelVictory: state.recordLevelVictory,
    }))
  );

  const { hasWon, score, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      hasWon: state.hasWon,
      score: state.score,
      initializeLevel: state.initializeLevel,
    }))
  );

  function handleCloseModal() {
    setIsMenuOpen(false);
  }

  function handleGoHome() {
    handleCloseModal();
    router.navigate("/");
  }

  function handleNextLevel() {
    handleCloseModal();

    recordLevelVictory({ currentLevel, score });

    const nextLevel = currentLevel + 1;
    setCurrentLevel({ nextLevel });
    initializeLevel({ currentLevel: nextLevel, forceRefresh: true });
  }

  function handlePlayAgain() {
    handleCloseModal();

    recordLevelVictory({ currentLevel, score });
    initializeLevel({ currentLevel, forceRefresh: true });
  }

  return (
    <ModalLayout
      isVisible={hasWon}
      delayMs={ANIMATION_DELAY_MS.SHOW_MODAL}>
      <View style={styles.iconCircle}>
        <FontAwesome6
          name="cake-candles"
          size={36}
          color={theme.colors.goldLight}
        />
      </View>

      <Text style={styles.title}>You win!</Text>
      <Text style={styles.subtitle}>Score: {score}</Text>

      <View style={styles.buttons}>
        <Button3d
          isFullWidth
          backgroundColor={theme.colors.greenLight}
          borderColor={theme.colors.greenButtonRim}
          onPress={handleGoHome}>
          <View style={styles.buttonWrapper}>
            <FontAwesome6
              name="house-chimney"
              size={16}
              color={theme.colors.foreground}
            />
            <Text style={styles.buttonText}>Home</Text>
          </View>
        </Button3d>

        <Button3d
          isFullWidth
          onPress={handleNextLevel}>
          <View style={styles.buttonWrapper}>
            <FontAwesome6
              name="circle-right"
              size={16}
              color={theme.colors.foreground}
            />
            <Text style={styles.buttonText}>Next level</Text>
          </View>
        </Button3d>

        <Button3d
          isFullWidth
          backgroundColor={theme.colors.red}
          borderColor={theme.colors.redButtonRim}
          onPress={handlePlayAgain}>
          <View style={styles.buttonWrapper}>
            <FontAwesome6
              name="rotate-right"
              size={16}
              color={theme.colors.foreground}
            />
            <Text style={styles.buttonText}>Play again</Text>
          </View>
        </Button3d>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.goldDarker,
    justifyContent: "center",
    alignItems: "center",
    marginBlockStart: 10,
    marginBlockEnd: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.greenDark,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  buttons: {
    width: "100%",
    gap: 20,
    marginBlockEnd: 10,
  },
  buttonWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  buttonText: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
});
