import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import { DeckCard, EmptyCard } from "@/components/card";
import Moves from "@/components/deck/moves";
import Waste from "@/components/deck/waste";

interface DeckProps {
  onCardDragEnd: (absoluteX: number, absoluteY: number) => void;
}

export default function Deck({ onCardDragEnd }: DeckProps) {
  const deck = useLevelStore((state) => state.deck);
  const drawCard = useLevelStore((state) => state.drawCard);

  return (
    <View style={styles.container}>
      <View style={styles.movesWrapper}>
        <Moves />
      </View>
      <View style={styles.right}>
        <View style={styles.slotWrapper}>
          <Waste onDragEnd={onCardDragEnd} />
        </View>

        <View style={styles.slotWrapper}>
          {deck.length > 0 ? (
            <DeckCard>
              <Text style={styles.deckCount}>{deck.length}</Text>
            </DeckCard>
          ) : (
            <EmptyCard onPress={drawCard}>
              <View style={styles.recycleCenter}>
                <FontAwesome6 name="rotate-left" size={20} color={theme.colors.accent} />
              </View>
            </EmptyCard>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBlockStart: 15,
    marginBlockEnd: 20,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginInlineEnd: 5,
  },
  movesWrapper: {
    width: 120,
  },
  slotWrapper: {
    width: 80,
  },
  deckCount: {
    color: theme.colors.foreground,
    fontWeight: "bold",
  },
  recycleCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
});
