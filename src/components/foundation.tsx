import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";
import { CardType } from "@/types";

import Card from "@/components/card";
import EmptyCard from "@/components/card/empty-card";

interface FoundationProps {
  stack: Array<CardType> | null;
}

export default function Foundation({ stack }: FoundationProps) {
  const topCard = stack && stack.length > 0 ? stack[stack.length - 1] : null;
  const hasStackedWords = stack && stack.length > 1;

  const anchorCard = stack ? stack.find((c) => c.type === "category") : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = anchorCard?.totalInCategory ?? 0;

  return (
    <View style={{ flex: 1 }}>
      {topCard ? (
        <View style={styles.cardContainer}>
          {hasStackedWords && (
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
        </View>
      ) : (
        <EmptyCard>
          <FontAwesome6 name="crown" size={20} color={theme.colors.greenLight} />
        </EmptyCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    position: "relative",
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
