import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { theme } from "@/lib/theme";

export default function MenuButton() {
  const scaleValue = useRef(new Animated.Value(1)).current;
  const router = useRouter();

  function handlePress() {
    router.navigate("/");
  }

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
    <Pressable onPress={handlePress} onPressIn={onPressIn} onPressOut={onPressOut}>
      <Animated.View style={[styles.menu, { transform: [{ scale: scaleValue }] }]}>
        <Ionicons name="menu" size={30} style={styles.icon} />
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
