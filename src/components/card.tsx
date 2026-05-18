import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useGameLogic } from "@/hooks/use-game-logic";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

interface Props {
  card: CardType;
  isSelected: boolean;
  keysCollected: number;
  onPress: () => void;
  index: number;
}

export default function Card({ card, isSelected, keysCollected, onPress, index }: Props) {
  const isLocked = (card.lockCount ?? 0) > keysCollected;
  const isAnchor = card.type === "category";

  const { gameState } = useGameLogic();

  const cardStyle = {
    marginTop: index === 0 ? 0 : -60,
    zIndex: index,
  };

  const categoryKey = Object.keys(gameState.foundation)[index];
  const stack = categoryKey ? gameState.foundation[categoryKey] : null;
  const topCard = stack ? stack[stack.length - 1] : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = topCard?.totalInCategory || 0;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[styles.card, cardStyle, !card.isFaceUp && styles.cardHidden, isAnchor && styles.anchorBorder, isSelected && styles.selectedCard, isLocked && styles.cardLocked]}>
      {isLocked ? (
        <Text style={styles.lockText}>🔒 {card.lockCount}</Text>
      ) : card.isFaceUp ? (
        <View style={styles.contentWrapper}>
          {isAnchor && (
            <>
              <Text style={styles.anchorIcon}>⭐</Text>
              <Text style={styles.counter}>
                {currentCount}/{totalNeeded}
              </Text>
            </>
          )}
          <Text style={styles.cardText}>{card.type === "key" ? "🔑" : card.content}</Text>
        </View>
      ) : (
        <Text style={styles.cardBackSymbol}>?</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 90,
    width: "100%",
    backgroundColor: theme.colors.cardFront,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  anchorBorder: {
    borderColor: theme.colors.secondary,
    borderWidth: 3,
    backgroundColor: theme.colors.cardBack,
  },
  anchorIcon: {
    position: "absolute",
    top: -10,
    left: -10,
    fontSize: 12,
  },
  selectedCard: {
    borderColor: theme.colors.cardForeground,
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  cardHidden: {
    backgroundColor: theme.colors.cardBack,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  contentWrapper: {
    padding: 20,
  },
  cardText: {
    fontSize: 12,
    fontWeight: "bold",
    color: theme.colors.cardForeground,
    textAlign: "center",
  },
  counter: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.cardForeground,
  },
  cardBackSymbol: {
    fontSize: 24,
    color: theme.colors.border,
    fontWeight: "bold",
  },
  cardLocked: {
    backgroundColor: theme.colors.locked,
    borderColor: theme.colors.lockedBorder,
  },
  lockText: {
    color: theme.colors.foreground,
    fontWeight: "bold",
    fontSize: 14,
  },
});
