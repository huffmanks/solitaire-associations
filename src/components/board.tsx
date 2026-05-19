import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";

import Card, { EmptyCard } from "@/components/card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";

export default function Board() {
  const { columns, selectedCardInfo, setSelectedCardInfo, moveCard, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      selectedCardInfo: state.selectedCardInfo,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
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
      <Deck />
      <Foundation />

      <View style={styles.board}>
        <View style={styles.tableau}>
          {columns.map((col, colIdx) => (
            <View key={colIdx} style={styles.column}>
              {col.map((card, cardIdx) => (
                <Card key={card.id} card={card} index={cardIdx} onPress={() => onColumnPress(colIdx)} />
              ))}
              {col.length === 0 && (
                <EmptyCard onPress={() => onColumnPress(colIdx)}>
                  <View></View>
                </EmptyCard>
              )}
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
    marginInline: 15,
  },
  board: {
    flex: 1,
    padding: 5,
  },
  tableau: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  column: {
    alignItems: "stretch",
    flex: 1,
  },
});
