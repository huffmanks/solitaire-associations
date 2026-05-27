import { Pressable, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { theme } from "@/lib/theme";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Button3dProps {
  isFullWidth?: boolean;
  isCircle?: boolean;
  isDisabled?: boolean;
  backgroundColor?: string;
  borderColor?: string;
  onPress: () => void;
  children: React.ReactNode;
}

export default function Button3d({ isFullWidth = false, isCircle = false, isDisabled = false, backgroundColor, borderColor, onPress, children }: Button3dProps) {
  const pressedProgress = useSharedValue(0);
  const shakeOffset = useSharedValue(0);

  const borderBottomWidth = {
    static: isCircle ? 3 : 7,
    pressed: isCircle ? 2 : 3,
  };

  const buttonStyles = {
    width: isCircle ? 40 : isFullWidth ? "100%" : 76,
    height: isCircle ? 40 : 60,
    borderWidth: borderBottomWidth.pressed,
    borderRadius: isCircle ? 9999 : 16,
    backgroundColor: backgroundColor ?? theme.colors.blueDark,
    borderColor: borderColor ?? theme.colors.blueButtonRim,
  };

  const springConfig = {
    damping: 15,
    stiffness: 150,
    mass: 0.5,
  };

  const animatedButtonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }, { translateY: withSpring(pressedProgress.value * 4, springConfig) }, { scaleY: withSpring(pressedProgress.value ? 0.95 : 1, springConfig) }],
      borderBottomWidth: withSpring(pressedProgress.value ? borderBottomWidth.pressed : borderBottomWidth.static, springConfig),
    };
  });

  function triggerErrorShake() {
    shakeOffset.value = withSequence(
      withTiming(-10, { duration: 40 }),
      withTiming(10, { duration: 40 }),
      withTiming(-6, { duration: 40 }),
      withTiming(6, { duration: 40 }),
      withTiming(0, { duration: 40 }),
    );
  }

  function handlePress() {
    if (isDisabled) {
      triggerErrorShake();
    } else {
      onPress();
    }
  }

  return (
    <AnimatedPressable
      style={[styles.button, buttonStyles, animatedButtonStyle, isDisabled && styles.disabled]}
      onPressIn={() => !isDisabled && (pressedProgress.value = 1)}
      onPressOut={() => !isDisabled && (pressedProgress.value = 0)}
      onPress={handlePress}>
      {children}
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  disabled: {
    backgroundColor: theme.colors.modalOverlay,
    opacity: 0.7,
  },
});
