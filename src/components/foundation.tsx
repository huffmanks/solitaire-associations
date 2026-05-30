import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedReaction, useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";

import { theme } from "@/lib/theme";
import { CardType } from "@/types";

import Card from "@/components/card";
import EmptyCard from "@/components/card/empty-card";

interface FoundationProps {
  stack: Array<CardType> | null;
}

export default function Foundation({ stack }: FoundationProps) {
  const hasStackedWords = stack && stack.length > 1;
  const anchorCard = stack ? stack.find((c) => c.type === "category") : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = anchorCard?.totalInCategory ?? 0;

  const isCategoryComplete = anchorCard !== null && currentCount === totalNeeded;
  const topCard = isCategoryComplete ? anchorCard : stack && stack.length > 0 ? stack[stack.length - 1] : null;

  const containerScale = useSharedValue(1);
  const ringScale = useSharedValue(1);
  const ringOpacity = useSharedValue(0);
  const trackingCount = useSharedValue(-1);
  const trackingCardId = useSharedValue<string | null>(null);

  useAnimatedReaction(
    () => {
      return {
        count: currentCount,
        id: topCard?.id ?? null,
        complete: isCategoryComplete,
        hasTopCard: topCard !== null,
      };
    },
    (prepareData) => {
      if (!prepareData.hasTopCard) {
        trackingCount.value = -1;
        trackingCardId.value = null;
        return;
      }

      if (prepareData.count !== trackingCount.value || prepareData.id !== trackingCardId.value) {
        trackingCount.value = prepareData.count;
        trackingCardId.value = prepareData.id;

        if (prepareData.complete) {
          containerScale.value = withSequence(withSpring(1.05, { damping: 15, stiffness: 300 }), withSpring(1, { damping: 5, stiffness: 180, mass: 0.8 }));

          ringScale.value = withSequence(withTiming(1, { duration: 600 }), withTiming(1.05, { duration: 300 }), withTiming(1, { duration: 600 }));

          ringOpacity.value = withSequence(withTiming(1, { duration: 600 }), withTiming(0.3, { duration: 300 }), withTiming(1, { duration: 600 }), withTiming(0, { duration: 300 }));
        } else {
          containerScale.value = 1;

          ringScale.value = withSequence(withTiming(1, { duration: 400 }), withTiming(1.05, { duration: 200 }), withTiming(1, { duration: 400 }));

          ringOpacity.value = withSequence(withTiming(1, { duration: 400 }), withTiming(1, { duration: 200 }), withTiming(0, { duration: 400 }));
        }
      }
    },
    [currentCount, topCard?.id, isCategoryComplete],
  );

  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const animatedRingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: ringOpacity.value,
  }));

  return (
    <View style={styles.container}>
      <View style={StyleSheet.absoluteFill}>
        <EmptyCard>
          <FontAwesome6 name="crown" size={20} color={theme.colors.greenLight} />
        </EmptyCard>
      </View>
      {topCard && (
        <Animated.View key={topCard.id} style={[styles.cardContainer, animatedContainerStyle]}>
          <Animated.View style={[styles.greenFlashRing, animatedRingStyle]} />
          {hasStackedWords && !isCategoryComplete && (
            <View style={styles.badgeTab}>
              <Text style={styles.badgeText} numberOfLines={1}>
                {topCard.category.toUpperCase()}
              </Text>
              <View style={styles.textCountWrapper}>
                <Text style={styles.textCount}>{currentCount}</Text>
                <Text style={styles.textCount}>/</Text>
                <Text style={styles.textCount}>{totalNeeded}</Text>
              </View>
            </View>
          )}
          <Card card={topCard} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardContainer: {
    flex: 1,
    position: "relative",
  },
  greenFlashRing: {
    ...StyleSheet.absoluteFill,
    borderWidth: 5,
    borderColor: theme.colors.greenLight,
    // borderColor: "#4BB543",
    borderRadius: 12,
    zIndex: 999,
    pointerEvents: "none",
  },
  badgeTab: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.goldDark,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 4,
  },
  badgeText: {
    color: theme.colors.cardForeground,
    fontSize: 8,
    fontWeight: 900,
    letterSpacing: 0.5,
    textAlign: "center",
  },
  textCountWrapper: {
    flexDirection: "row",
    gap: 2,
  },
  textCount: {
    color: theme.colors.cardForeground,
    fontWeight: 700,
    fontSize: 11,
  },
});
