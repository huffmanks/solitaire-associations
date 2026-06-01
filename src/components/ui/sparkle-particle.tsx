import { memo } from "react";
import { StyleSheet } from "react-native";
import Animated, { SharedValue, useAnimatedStyle } from "react-native-reanimated";

import { theme } from "@/lib/theme";

const PARTICLE_COUNT = 20;
export const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
  const angle = (i * 2 * Math.PI) / PARTICLE_COUNT + (Math.random() * 0.4 - 0.2);
  const distance = 40 + Math.random() * 50;
  return {
    x: Math.cos(angle) * distance,
    y: Math.sin(angle) * distance,
    size: 3 + Math.random() * 4,
  };
});

interface SparkParticleProps {
  particle: (typeof PARTICLES)[number];
  index: number;
  progress: SharedValue<number>;
}

const SparkParticle = memo(({ particle, index, progress }: SparkParticleProps) => {
  const animatedParticleStyle = useAnimatedStyle(() => {
    const p = progress.value;
    const opacity = p === 0 ? 0 : p < 0.6 ? 1 : Math.max(0, 1 - (p - 0.6) / 0.4);
    const scale = p < 0.1 ? p * 10 : Math.max(0, 1.2 - p * 0.8);

    return {
      opacity: opacity,
      transform: [{ translateX: particle.x * p }, { translateY: particle.y * p }, { scale: scale }],
    };
  });

  return (
    <Animated.View
      style={[
        styles.sparkParticle,
        {
          width: particle.size,
          height: particle.size,
          borderRadius: particle.size / 2,
          backgroundColor:
            index % 3 === 0
              ? theme.colors.foreground
              : index % 2 === 0
                ? theme.colors.goldDark
                : theme.colors.goldLight,
        },
        animatedParticleStyle,
      ]}
    />
  );
});

SparkParticle.displayName = "SparkParticle";
export default SparkParticle;

const styles = StyleSheet.create({
  sparkParticle: {
    position: "absolute",
    borderWidth: 0.5,
    borderColor: theme.colors.gray,
  },
});
