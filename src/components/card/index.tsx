import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LayoutChangeEvent, StyleSheet, Text, View, ViewStyle } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

import CardWrapper from "@/components/card/card-wrapper";
import type { OnDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  card: CardType;
  containerStyle?: ViewStyle;
  isTopCard?: boolean;
  onDragStart?: () => void;
  onDragEnd?: OnDragEnd;
  onLayout?: (event: LayoutChangeEvent) => void;
}

export default function Card({ columnIndex, cardIndex, stackStartIndex, card, containerStyle, isTopCard = true, onDragStart, onDragEnd, onLayout }: CardProps) {
  const foundation = useLevelStore((state) => state.foundation);
  const selectedCardInfo = useLevelStore((state) => state.selectedCardInfo);

  const isSelected = selectedCardInfo?.cardId === card.id;
  const stack = Array.isArray(foundation) ? foundation.find((slot) => slot !== null && slot.length > 0 && slot[0].category === card.category) || null : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = card.totalInCategory || 0;

  if (!card.isFaceUp) {
    return (
      <CardWrapper columnIndex={columnIndex} cardIndex={cardIndex} stackStartIndex={stackStartIndex} variant="hidden" isSelected={isSelected} containerStyle={containerStyle} onLayout={onLayout} />
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
        isSelected={isSelected}
        containerStyle={containerStyle}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onLayout={onLayout}>
        <View style={styles.categoryHeader}>
          <Text style={styles.text}>{`${currentCount}/${totalNeeded}`}</Text>
          <FontAwesome6 name="crown" size={18} color={theme.colors.goldDark} />
        </View>
        <Text style={[styles.text, styles.textContent, styles.categoryTextOffset]}>{card.content}</Text>
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
      isSelected={isSelected}
      containerStyle={containerStyle}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onLayout={onLayout}>
      <Text style={[styles.text, styles.textContent, !isTopCard && styles.peekTextOffset]}>{card.content}</Text>
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
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
  },
  categoryTextOffset: {
    paddingTop: 10,
  },
  peekTextOffset: {
    fontSize: 11,
    lineHeight: 12,
    fontWeight: "600",
    textAlign: "center",
    width: "90%",
  },
  text: {
    color: theme.colors.cardForeground,
    fontWeight: "700",
    fontSize: 12,
  },
  textContent: {
    fontSize: 14,
    textAlign: "center",
  },
});
