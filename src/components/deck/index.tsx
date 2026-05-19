import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import { DeckCard } from "@/components/card";
import Moves from "@/components/deck/moves";
import Waste from "@/components/deck/waste";

export default function Deck() {
  const deck = useLevelStore((state) => state.deck);

  return (
    <View style={styles.container}>
      <View style={styles.movesWrapper}>
        <Moves />
      </View>
      <View style={styles.right}>
        <View style={styles.slotWrapper}>
          <Waste />
        </View>

        <View style={styles.slotWrapper}>
          <DeckCard>
            <Text style={styles.deckCount}>{deck.length}</Text>
          </DeckCard>
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
});
