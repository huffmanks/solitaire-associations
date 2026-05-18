import { Pressable, StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";
import { CardType } from "@/types";

import Moves from "@/components/deck/moves";

interface DeckProps {
  deckCount: number;
  topWasteCard: CardType;
  onDraw: () => void;
  onWastePress: () => void;
}

export default function Deck({ deckCount, topWasteCard, onDraw, onWastePress }: DeckProps) {
  return (
    <View style={styles.container}>
      <View>
        <Moves />
      </View>
      <View style={styles.right}>
        <Pressable onPress={onWastePress} style={[styles.slot, !topWasteCard && styles.emptySlot]}>
          {topWasteCard && (
            <View style={styles.wasteCard}>
              <Text style={styles.cardText}>{topWasteCard.content}</Text>
            </View>
          )}
        </Pressable>

        <Pressable onPress={onDraw} style={styles.deckStack}>
          <View style={styles.cardBack}>
            <Text style={styles.deckCount}>{deckCount}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginInline: 10,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  slot: {
    width: 60,
    height: 100,
    borderRadius: 6,
    backgroundColor: theme.colors.foreground,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  emptySlot: {
    backgroundColor: theme.colors.muted,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
  },
  wasteCard: {
    width: "100%",
    height: 100,
    backgroundColor: theme.colors.foreground,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  deckStack: {
    width: 60,
    height: 90,
    backgroundColor: theme.colors.cardBack,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.foreground,
    justifyContent: "center",
    alignItems: "center",
  },
  cardBack: {
    alignItems: "center",
  },
  deckCount: {
    color: theme.colors.foreground,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.cardForeground,
    textAlign: "center",
    padding: 2,
  },
});
