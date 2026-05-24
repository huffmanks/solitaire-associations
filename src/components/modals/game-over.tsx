import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

export default function GameOverModal() {
  const { hasLost, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      hasLost: state.hasLost,
      initializeLevel: state.initializeLevel,
    })),
  );

  return (
    <Modal visible={hasLost} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.iconCircle}>
            <FontAwesome6 name="heart-crack" size={36} color={"red"} />
          </View>

          <Text style={styles.title}>Out of Moves!</Text>
          <Text style={styles.subtitle}>You’ve reached your maximum move limit for this level. Don’t worry, you can try again!</Text>

          <Pressable style={styles.button} onPress={() => initializeLevel()}>
            <FontAwesome6 name="rotate-right" size={16} color={theme.colors.foreground} style={styles.buttonIcon} />
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)", // TODO change to theme color Dimmed background overlay
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: theme.colors.cardFront,
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.muted,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: theme.colors.cardForeground,
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
  button: {
    flexDirection: "row",
    backgroundColor: theme.colors.background,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: theme.colors.foreground,
    fontSize: 16,
    fontWeight: "700",
  },
});
