import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

import { useShallow } from "zustand/shallow";

import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import ModalLayout from "@/components/modals/modal-layout";
import Button3d from "@/components/ui/button-3d";

export default function GameOverModal() {
  const currentLevel = useGameStore((state) => state.currentLevel);
  const { hasLost, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      hasLost: state.hasLost,
      initializeLevel: state.initializeLevel,
    }))
  );

  return (
    <ModalLayout isVisible={hasLost}>
      <View style={styles.iconCircle}>
        <FontAwesome6
          name="heart-crack"
          size={36}
          color={theme.colors.redButtonRim}
        />
      </View>

      <Text style={styles.title}>Out of Moves!</Text>
      <Text style={styles.subtitle}>
        You’ve reached your maximum move limit for this level. Don’t worry, you can try again!
      </Text>

      <Button3d
        isFullWidth
        backgroundColor={theme.colors.greenLight}
        borderColor={theme.colors.greenButtonRim}
        onPress={() => initializeLevel({ currentLevel, forceRefresh: true })}>
        <View style={styles.buttonWrapper}>
          <FontAwesome6
            name="rotate-right"
            size={16}
            color={theme.colors.foreground}
          />
          <Text style={styles.buttonText}>Try again</Text>
        </View>
      </Button3d>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.red,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
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
