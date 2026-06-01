import Ionicons from "@expo/vector-icons/Ionicons";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { theme } from "@/lib/theme";

interface MenuButtonProps {
  setIsMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function MenuButton({ setIsMenuOpen }: MenuButtonProps) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  function onPressIn() {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  }

  function onPressOut() {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  return (
    <Pressable
      onPress={() => setIsMenuOpen(true)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}>
      <Animated.View style={[styles.menu, { transform: [{ scale: scaleValue }] }]}>
        <Ionicons
          name="menu"
          size={30}
          style={styles.icon}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menu: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingInline: 15,
    paddingBlock: 5,
    backgroundColor: "transparent",
  },
  icon: {
    color: theme.colors.foreground,
  },
});
