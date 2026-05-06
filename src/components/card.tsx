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

  // Vertical overlap effect typical of Solitaire
  const cardStyle = {
    marginTop: index === 0 ? 0 : -60,
    zIndex: index,
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.card,
        cardStyle,
        !card.isFaceUp && styles.cardHidden,
        isAnchor && styles.anchorBorder, // Special gold border logic
        isSelected && styles.selectedCard,
        isLocked && styles.cardLocked,
      ]}>
      {isLocked ? (
        <Text style={styles.lockText}>🔒 {card.lockCount}</Text>
      ) : card.isFaceUp ? (
        <View style={styles.contentWrapper}>
          {isAnchor && <Text style={styles.anchorIcon}>⭐</Text>}
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
  cardText: { fontSize: 12, fontWeight: "bold", color: "#2c3e50", textAlign: "center" },
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
