import { useEffect, useState } from "react";
import { Modal, StyleSheet, View } from "react-native";

import { theme } from "@/lib/theme";

interface ModalLayoutProps {
  isVisible: boolean;
  children: React.ReactNode;
  delayMs?: number;
}

export default function ModalLayout({ isVisible, children, delayMs = 0 }: ModalLayoutProps) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    if (isVisible) {
      if (delayMs > 0) {
        timeoutId = setTimeout(() => {
          setShouldRender(true);
        }, delayMs);
      } else {
        setShouldRender(true);
      }
    } else {
      setShouldRender(false);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isVisible, delayMs]);

  return (
    <Modal
      visible={shouldRender}
      transparent
      animationType="fade"
      statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: theme.colors.modalOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: theme.colors.cardFront,
    borderRadius: 20,
    padding: 15,
    alignItems: "center",
    elevation: 5,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
