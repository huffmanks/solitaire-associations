import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { StyleSheet, Text, TextStyle, View } from "react-native";

import { theme } from "@/lib/theme";
import { getLockKeyCardColors } from "@/lib/utils";
import { CardType } from "@/types";

type DynamicStyles = Record<string, TextStyle>;

export function VisibleCardContent({
  card,
  isTopCard,
  dynamicStyles,
}: {
  card: CardType;
  isTopCard: boolean;
  dynamicStyles: DynamicStyles;
}) {
  return (
    <Text
      numberOfLines={1}
      style={[
        styles.baseTextContent,
        dynamicStyles.baseTextContent,
        styles.textContent,
        !isTopCard ? [styles.peekTextOffset, dynamicStyles.peekTextOffset] : null,
      ]}>
      {card.content}
    </Text>
  );
}

export function CategoryCardContent({
  card,
  currentCount,
  totalNeeded,
  categoryCrownSize,
  dynamicStyles,
}: {
  card: CardType;
  currentCount: number;
  totalNeeded: number;
  categoryCrownSize: number;
  dynamicStyles: DynamicStyles;
}) {
  return (
    <>
      <View style={styles.categoryHeader}>
        <View style={styles.categoryTextCountWrapper}>
          <Text style={[styles.categoryTextCount, dynamicStyles.categoryTextCount]}>
            {currentCount}
          </Text>
          <Text style={[styles.categoryTextCount, dynamicStyles.categoryTextCount]}>/</Text>
          <Text style={[styles.categoryTextCount, dynamicStyles.categoryTextCount]}>
            {totalNeeded}
          </Text>
        </View>
        <FontAwesome6
          name="crown"
          size={categoryCrownSize}
          color={theme.colors.purpleLight}
        />
      </View>
      <Text
        style={[
          styles.baseTextContent,
          dynamicStyles.baseTextContent,
          styles.categoryTextContent,
          styles.categoryTextOffset,
        ]}>
        {card.content}
      </Text>
    </>
  );
}

export function LockCardContent({ card }: { card: CardType }) {
  const keysRemaining = `${card.keysCollected || 0} / ${card.keysRequired || 1} keys`;

  const { accentColor } = getLockKeyCardColors({ lockColorId: card.lockColorId });

  return (
    <View style={styles.lockCardWrapper}>
      <FontAwesome6
        name="lock"
        size={24}
        color={accentColor}
      />
      <Text style={[styles.lockText, { color: accentColor }]}>{keysRemaining}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  categoryHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
  },
  categoryTextOffset: {
    paddingTop: 10,
  },
  peekTextOffset: {
    width: "100%",
    paddingInline: 4,
    fontWeight: "900",
    textAlign: "center",
    letterSpacing: 0.05,
  },
  categoryTextCountWrapper: {
    flexDirection: "row",
    gap: 2,
  },
  categoryTextCount: {
    color: theme.colors.foreground,
    fontWeight: "900",
  },
  baseTextContent: {
    fontWeight: "900",
    textAlign: "center",
    paddingInline: 4,
  },
  categoryTextContent: {
    color: theme.colors.foreground,
  },
  textContent: {
    color: theme.colors.cardForeground,
  },
  lockCardWrapper: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  lockText: {
    fontWeight: "900",
    fontSize: 11,
  },
});
