import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import ModalLayout from "@/components/modals/modal-layout";
import Button3d from "@/components/ui/button-3d";

interface MenuModalProps {
  isMenuOpen: boolean;
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MenuModal({ isMenuOpen, setIsMenuOpen }: MenuModalProps) {
  const router = useRouter();

  const currentLevel = useGameStore((state) => state.currentLevel);
  const initializeLevel = useLevelStore((state) => state.initializeLevel);

  function handleGoHome() {
    setIsMenuOpen(false);
    router.navigate("/");
  }

  function handleRestart() {
    setIsMenuOpen(false);
    initializeLevel({ currentLevel, forceRefresh: true });
  }

  return (
    <ModalLayout isVisible={isMenuOpen}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.menuText}>Menu</Text>

          <View style={styles.closeButtonWrapper}>
            <Button3d isCircle backgroundColor={theme.colors.red} borderColor={theme.colors.redButtonRim} onPress={() => setIsMenuOpen(false)}>
              <FontAwesome6 name="x" size={16} color={theme.colors.foreground} />
            </Button3d>
          </View>
        </View>

        <Button3d isFullWidth backgroundColor={theme.colors.greenLight} borderColor={theme.colors.greenButtonRim} onPress={handleGoHome}>
          <View style={styles.buttonWrapper}>
            <FontAwesome6 name="house-chimney" size={16} color={theme.colors.foreground} />
            <Text style={styles.buttonText}>Home</Text>
          </View>
        </Button3d>

        <Button3d isFullWidth onPress={handleRestart}>
          <View style={styles.buttonWrapper}>
            <FontAwesome6 name="rotate-right" size={16} color={theme.colors.foreground} />
            <Text style={styles.buttonText}>Restart</Text>
          </View>
        </Button3d>
      </View>
    </ModalLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    gap: 20,
    padding: 15,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: theme.colors.cardFrontBorder,
  },
  header: {
    position: "relative",
    marginBlockEnd: 20,
  },
  closeButtonWrapper: {
    position: "absolute",
    top: -2,
    right: 0,
  },
  menuText: {
    color: theme.colors.muted,
    fontSize: 28,
    fontWeight: 700,
    textAlign: "center",
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
