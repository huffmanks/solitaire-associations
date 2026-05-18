import { useState } from "react";
import { Dimensions, Pressable, StyleSheet, View } from "react-native";

import { useGameLogic } from "@/hooks/use-game-logic";
import { theme } from "@/lib/theme";

import Card from "@/components/card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";

const { width } = Dimensions.get("window");

export default function Board() {
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  const { gameState, revealCard, selectedCardInfo, setSelectedCardInfo, moveCard, drawCard, moveWasteToFoundation } = useGameLogic();
  const colWidth = width / gameState.columns.length - 10;

  const onColumnPress = (colIndex: number) => {
    if (selectedCardInfo === null) {
      const col = gameState.columns[colIndex];
      if (col.length > 0 && col[col.length - 1].isFaceUp) {
        setSelectedCardInfo({ type: "tableau", colIndex });
      }
    } else {
      moveCard(colIndex);
    }
  };

  return (
    <View style={styles.container}>
      <Deck
        deckCount={gameState.deck.length}
        topWasteCard={gameState.waste[gameState.waste.length - 1]}
        onDraw={drawCard}
        onWastePress={() => {
          if (gameState.waste.length > 0) {
            setSelectedCardInfo({ type: "waste" });
          }
        }}
      />

      <View style={styles.header}>
        <Foundation foundation={gameState.foundation} columnCount={gameState.columns.length} />
      </View>
      <View style={styles.board}>
        <View style={styles.tableau}>
          {gameState.columns.map((col, colIdx) => (
            <View key={colIdx} style={[styles.column, { width: colWidth }]}>
              {col.map((card, cardIdx) => {
                const isSelected = selectedCardInfo?.type === "tableau" && selectedCardInfo?.colIndex === colIdx && cardIdx === col.length - 1;
                return <Card key={card.id} card={card} isSelected={isSelected} index={cardIdx} keysCollected={gameState.keysCollected} onPress={() => onColumnPress(colIdx)} />;
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
    gap: 10,
  },
  column: {
    alignItems: "center",
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
    height: 100,
    backgroundColor: theme.colors.muted,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    width: "100%",
  },
});
