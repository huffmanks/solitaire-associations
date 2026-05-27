import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import DeckCard from "@/components/card/deck-card";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";
import Moves from "@/components/deck/moves";
import Waste from "@/components/deck/waste";

interface DeckProps {
  cardWidth: number;
  handleDragEnd: OnCardDragEnd;
}

export default function Deck({ cardWidth, handleDragEnd }: DeckProps) {
  const deck = useLevelStore((state) => state.deck);

  const cardSize = {
    width: cardWidth,
    height: Math.floor(cardWidth * (3 / 2)),
  };

  return (
    <View style={styles.container}>
      <View>
        <Moves cardSize={cardSize} />
      </View>

      <View style={cardSize}>
        <Waste handleDragEnd={handleDragEnd} />
      </View>

      <View style={cardSize}>
        <DeckCard isHidden={deck.length > 0}>
          {deck.length > 0 ? (
            <Text style={styles.deckCount}>{deck.length}</Text>
          ) : (
            <View style={styles.recycleCenter}>
              <FontAwesome6 name="rotate-left" size={20} color={theme.colors.greenLight} />
            </View>
          )}
        </DeckCard>
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
    marginBlockEnd: 10,
    marginInline: 15,
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
