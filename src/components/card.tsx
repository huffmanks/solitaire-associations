import { useGameLogic } from "@/hooks/use-game-logic";
import { CardType } from "@/types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    backgroundColor: "#fff",
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  anchorBorder: {
    borderColor: "#FFD700",
    borderWidth: 3,
    backgroundColor: "#fffdf0",
  },
  anchorIcon: {
    position: "absolute",
    top: -10,
    left: -10,
    fontSize: 12,
  },
  selectedCard: {
    borderColor: "#00fbff",
    borderWidth: 2,
    transform: [{ scale: 1.05 }],
  },
  cardHidden: { backgroundColor: "#2c3e50", borderWidth: 2, borderColor: "#ecf0f1" },
  contentWrapper: {
    padding: 20,
  },
  cardText: { fontSize: 12, fontWeight: "bold", color: "#2c3e50", textAlign: "center" },
  counter: {
    position: "absolute",
    top: -10,
    right: -10,
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  cardBackSymbol: {
    fontSize: 24,
    color: "rgba(255,255,255,0.4)",
    fontWeight: "bold",
  },
  cardLocked: {
    backgroundColor: "#576574",
    borderColor: "#222f3e",
  },
  lockText: {
    color: "#ff9ff3",
    fontWeight: "bold",
    fontSize: 14,
  },
});
