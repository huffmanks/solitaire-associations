import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View, ViewStyle } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

import CardWrapper from "@/components/card/card-wrapper";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  card: CardType;
  containerStyle?: ViewStyle;
  isTopCard?: boolean;
  onDragStart?: () => void;
  onDragEnd?: OnCardDragEnd;
}

export default function Card({
  columnIndex,
  cardIndex,
  stackStartIndex,
  card,
  containerStyle,
  isTopCard = true,
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

  const dynamicSizes = {
    categoryTextCount: {
      fontSize: numberOfColumns === 5 ? 9 : numberOfColumns === 4 ? 11 : 12,
    },
    baseTextContent: {
      fontSize: numberOfColumns === 5 ? 11 : numberOfColumns === 4 ? 13 : 14,
    },
    peekTextOffset: {
      fontSize: numberOfColumns === 3 ? 11 : 10,
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
        containerStyle={containerStyle}
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
        containerStyle={containerStyle}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}>
        <View style={styles.categoryHeader}>
          <View style={styles.categoryTextCountWrapper}>
            <Text style={[styles.categoryTextCount, dynamicSizes.categoryTextCount]}>
              {currentCount}
            </Text>
            <Text style={[styles.categoryTextCount, dynamicSizes.categoryTextCount]}>/</Text>
            <Text style={[styles.categoryTextCount, dynamicSizes.categoryTextCount]}>
              {totalNeeded}
            </Text>
          </View>
          <FontAwesome6
            name="crown"
            size={dynamicSizes.categoryCrownSize}
            color={theme.colors.categoryCardForeground}
          />
        </View>
        <Text
          style={[
            styles.baseTextContent,
            dynamicSizes.baseTextContent,
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
      isTopCard={isTopCard}
      containerStyle={containerStyle}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}>
      <Text
        style={[
          styles.baseTextContent,
          dynamicSizes.baseTextContent,
          styles.textContent,
          !isTopCard ? [styles.peekTextOffset, dynamicSizes.peekTextOffset] : null,
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
    lineHeight: 12,
    fontWeight: "600",
    textAlign: "center",
    width: "90%",
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
  },
  categoryTextContent: {
    color: theme.colors.categoryCardForeground,
  },
  textContent: {
    color: theme.colors.cardForeground,
  },
});
