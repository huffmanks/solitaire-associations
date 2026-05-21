import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";

import Card, { EmptyCard } from "@/components/card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import GameOverModal from "@/components/game-over-modal";

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

  useEffect(() => {
    initializeLevel();
  }, []);

  function handleColumnInteraction(colIndex: number) {
    const col = columns[colIndex] || [];

    if (selectedCardInfo === null) {
      if (col.length > 0) {
        const topCard = col[col.length - 1];
        if (topCard.isFaceUp) {
          setSelectedCardInfo({ cardId: topCard.id, type: "tableau", colIndex });
        }
      }
    } else {
      if (selectedCardInfo.type === "tableau" && selectedCardInfo.colIndex === colIndex) {
        setSelectedCardInfo(null);
        return;
      }

      moveCard(colIndex);
    }
  }

  return (
    <View style={styles.container}>
      <Deck />
      <Foundation />

      <View style={styles.board}>
        <View style={styles.tableau}>
          {columns.map((col, colIdx) => (
            <View key={colIdx} style={styles.column}>
              {col.map((card, cardIdx) => {
                const isTopCard = cardIdx === col.length - 1;
                const topCardInColumn = col[col.length - 1];
                const isPartofActiveChain = card.isFaceUp && topCardInColumn && card.category === topCardInColumn.category;

                return <Card key={card.id} card={card} index={cardIdx} isTopCard={isTopCard} onPress={isPartofActiveChain ? () => handleColumnInteraction(colIdx) : () => {}} />;
              })}

              {col.length === 0 && (
                <EmptyCard onPress={() => handleColumnInteraction(colIdx)}>
                  <View />
                </EmptyCard>
              )}
            </View>
          ))}
        </View>
      </View>
      <GameOverModal />
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
