import Card from "@/components/card";
import Foundation from "@/components/foundation";
import { useGameLogic } from "@/hooks/use-game-logic";
import React, { useState } from "react";
import { Dimensions, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Deck from "./deck";

const { width } = Dimensions.get("window");

export default function Board({ level }: { level: number }) {
  const [selectedCol, setSelectedCol] = useState<number | null>(null);

  const { gameState, revealCard, selectedCardInfo, setSelectedCardInfo, moveCard, drawCard, moveWasteToFoundation } = useGameLogic(level);
  const colWidth = width / gameState.columns.length - 10;

  const onColumnPress = (colIndex: number) => {
    // If nothing is selected, we try to pick up the top card of this column
    if (selectedCardInfo === null) {
      const col = gameState.columns[colIndex];
      if (col.length > 0 && col[col.length - 1].isFaceUp) {
        setSelectedCardInfo({ type: "tableau", colIndex });
      }
    }
    // If something is already selected, this column is our "target"
    else {
      moveCard(colIndex);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Foundation foundation={gameState.foundation} columnCount={gameState.columns.length} />

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
      </View>
      <View style={styles.board}>
        {/* Foundation slots at the top */}
        <View style={styles.foundationRow}>
          {Object.keys(gameState.foundation).map((cat) => (
            <View key={cat} style={[styles.slot, { width: colWidth }]} />
          ))}
        </View>

        {/* Dynamic Tableau */}
        <View style={styles.tableau}>
          {gameState.columns.map((col, colIdx) => (
            <View key={colIdx} style={[styles.column, { width: colWidth }]}>
              {col.map((card, cardIdx) => {
                const isSelected = selectedCardInfo?.type === "tableau" && selectedCardInfo?.colIndex === colIdx && cardIdx === col.length - 1;
                return <Card key={card.id} card={card} isSelected={isSelected} index={cardIdx} keysCollected={gameState.keysCollected} onPress={() => onColumnPress(colIdx)} />;
              })}
              {col.length === 0 && <TouchableOpacity style={styles.emptyColumnSpace} onPress={() => onColumnPress(colIdx)} />}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a472a", // Classic card table green
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingTop: 10,
    zIndex: 100, // Ensure deck menu stays on top
  },
  board: { flex: 1, backgroundColor: "#1a472a", padding: 5 },
  foundationRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 20 },
  tableau: { flexDirection: "row", justifyContent: "space-between" },
  column: { alignItems: "center", flex: 1 },
  slot: { height: 80, borderStyle: "dashed", borderWidth: 1, borderColor: "rgba(255,255,255,0.5)", borderRadius: 4 },
});
