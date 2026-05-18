import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { theme } from "@/lib/theme";

import Card from "@/components/card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import { useLevelStore } from "@/lib/store/level";

export default function Board() {
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  const { deck, waste, columns, foundation, revealCard, selectedCardInfo, setSelectedCardInfo, moveCard, drawCard, moveWasteToFoundation, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      deck: state.deck,
      waste: state.waste,
      columns: state.columns,
      foundation: state.foundation,
      revealCard: state.revealCard,
      selectedCardInfo: state.selectedCardInfo,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
      drawCard: state.drawCard,
      moveWasteToFoundation: state.moveWasteToFoundation,
      initializeLevel: state.initializeLevel,
    })),
  );

  const onColumnPress = (colIndex: number) => {
    if (selectedCardInfo === null) {
      const col = columns[colIndex];
      if (col.length > 0 && col[col.length - 1].isFaceUp) {
        setSelectedCardInfo({ type: "tableau", colIndex });
      }
    } else {
      moveCard(colIndex);
    }
  };

  useEffect(() => {
    initializeLevel(1);
  }, []);

  return (
    <View style={styles.container}>
      <Deck
        deckCount={deck.length}
        topWasteCard={waste[waste.length - 1]}
        onDraw={drawCard}
        onWastePress={() => {
          if (waste.length > 0) {
            setSelectedCardInfo({ type: "waste" });
          }
        }}
      />

      <View style={styles.header}>
        <Foundation foundation={foundation} columnCount={columns.length} />
      </View>
      <View style={styles.board}>
        <View style={styles.tableau}>
          {columns.map((col, colIdx) => (
            <View key={colIdx} style={styles.column}>
              {col.map((card, cardIdx) => {
                const isSelected = selectedCardInfo?.type === "tableau" && selectedCardInfo?.colIndex === colIdx && cardIdx === col.length - 1;
                return <Card key={card.id} card={card} isSelected={isSelected} index={cardIdx} onPress={() => onColumnPress(colIdx)} />;
              })}
              {col.length === 0 && <Pressable style={styles.emptyColumnSpace} onPress={() => onColumnPress(colIdx)} />}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 100,
  },
  board: {
    flex: 1,
    padding: 5,
  },
  foundationRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  tableau: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    width: "100%",
  },
  column: {
    alignItems: "stretch",
    flex: 1,
  },
  slot: {
    height: 80,
    borderStyle: "dashed",
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 4,
  },
  emptyColumnSpace: {
    aspectRatio: 2 / 3,
    backgroundColor: theme.colors.muted,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 8,
    width: "100%",
  },
});
