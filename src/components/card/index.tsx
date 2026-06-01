import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType, SpacingVariant } from "@/types";

import CardWrapper from "@/components/card/card-wrapper";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  card: CardType;
  isTopCard?: boolean;
  spacingVariant?: SpacingVariant;
  onDragStart?: () => void;
  onDragEnd?: OnCardDragEnd;
}

export default function Card({
  columnIndex,
  cardIndex,
  stackStartIndex,
  card,
  isTopCard = true,
  spacingVariant,
  onDragStart,
  onDragEnd,
}: CardProps) {
  const foundation = useLevelStore((state) => state.foundation);
  const numberOfColumns = useLevelStore((state) => state.numberOfColumns);

  const stack = Array.isArray(foundation)
    ? foundation.find(
        (slot) => slot !== null && slot.length > 0 && slot[0].category === card.category
      ) || null
    : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = card.totalInCategory || 0;

  const dynamicStyles = {
    categoryTextCount: {
      fontSize: numberOfColumns === 5 ? 9 : numberOfColumns === 4 ? 11 : 12,
    },
    baseTextContent: {
      fontSize: numberOfColumns === 5 ? 11 : numberOfColumns === 4 ? 13 : 14,
    },
    peekTextOffset: {
      fontSize: spacingVariant === "small" ? 8 : numberOfColumns === 3 ? 11 : 10,
      lineHeight: spacingVariant === "small" ? 9 : 12,
      display: spacingVariant === "condensed" ? ("none" as const) : ("flex" as const),
    },
    categoryCrownSize: numberOfColumns === 5 ? 12 : numberOfColumns === 4 ? 15 : 18,
  };

  if (!card.isFaceUp) {
    return (
      <CardWrapper
        columnIndex={columnIndex}
        cardIndex={cardIndex}
        stackStartIndex={stackStartIndex}
        variant="hidden"
      />
    );
  }

  if (card.type === "category") {
    return (
      <CardWrapper
        columnIndex={columnIndex}
        cardIndex={cardIndex}
        stackStartIndex={stackStartIndex}
        variant="category"
        isTopCard={isTopCard}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}>
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
            size={dynamicStyles.categoryCrownSize}
            color={theme.colors.categoryCardForeground}
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
      </CardWrapper>
    );
  }

  return (
    <CardWrapper
      columnIndex={columnIndex}
      cardIndex={cardIndex}
      stackStartIndex={stackStartIndex}
      variant="visible"
      spacingVariant={spacingVariant}
      isTopCard={isTopCard}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
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
    </CardWrapper>
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
    color: theme.colors.categoryCardForeground,
    fontWeight: "900",
  },
  baseTextContent: {
    fontWeight: "900",
    textAlign: "center",
    paddingInline: 4,
  },
  categoryTextContent: {
    color: theme.colors.categoryCardForeground,
  },
  textContent: {
    color: theme.colors.cardForeground,
  },
});
