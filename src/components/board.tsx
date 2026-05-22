import { ComponentRef, useEffect, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";

import Card, { EmptyCard } from "@/components/card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import GameOverModal from "@/components/game-over-modal";

type DropTargetHit = {
  type: "tableau" | "foundation";
  index: number;
};

function measureView(ref: ComponentRef<typeof View> | null) {
  return new Promise<{ x: number; y: number; width: number; height: number } | null>((resolve) => {
    if (!ref || typeof ref.measureInWindow !== "function") {
      resolve(null);
      return;
    }

    ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
}

function isPointInside(rect: { x: number; y: number; width: number; height: number }, x: number, y: number) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

export default function Board() {
  const { columns, setSelectedCardInfo, moveCard, moveToFoundation, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
      moveToFoundation: state.moveToFoundation,
      initializeLevel: state.initializeLevel,
    })),
  );

  const tableauRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);
  const foundationRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);

  useEffect(() => {
    initializeLevel();
  }, []);

  async function findDropTarget(absoluteX: number, absoluteY: number): Promise<DropTargetHit | null> {
    for (let i = 0; i < foundationRefs.current.length; i++) {
      const rect = await measureView(foundationRefs.current[i]);
      if (rect && isPointInside(rect, absoluteX, absoluteY)) {
        return { type: "foundation", index: i };
      }
    }

    for (let i = 0; i < tableauRefs.current.length; i++) {
      const rect = await measureView(tableauRefs.current[i]);
      if (rect && isPointInside(rect, absoluteX, absoluteY)) {
        return { type: "tableau", index: i };
      }
    }

    return null;
  }

  async function handleDragEnd(absoluteX: number, absoluteY: number) {
    const hitTarget = await findDropTarget(absoluteX, absoluteY);
    if (!hitTarget) {
      setSelectedCardInfo(null);
      return;
    }

    if (hitTarget.type === "foundation") {
      moveToFoundation(hitTarget.index);
      return;
    }

    moveCard(hitTarget.index);
  }

  return (
    <View style={styles.container}>
      <Deck onCardDragEnd={handleDragEnd} />
      <Foundation slotRefs={foundationRefs} />

      <View style={styles.board}>
        <View style={styles.tableau}>
          {columns.map((col, colIdx) => (
            <View
              key={colIdx}
              style={styles.column}
              ref={(ref) => {
                tableauRefs.current[colIdx] = ref;
              }}>
              {col.map((card, cardIdx) => {
                const isTopCard = cardIdx === col.length - 1;
                const topCardInColumn = col[col.length - 1];
                const isContiguousActiveChain = (() => {
                  if (!card.isFaceUp || !topCardInColumn || card.category !== topCardInColumn.category) {
                    return false;
                  }

                  for (let i = cardIdx; i < col.length; i++) {
                    const current = col[i];
                    if (!current.isFaceUp || current.category !== topCardInColumn.category) {
                      return false;
                    }
                  }

                  return true;
                })();

                return (
                  <Card
                    key={card.id}
                    card={card}
                    index={cardIdx}
                    isTopCard={isTopCard}
                    onDragStart={isContiguousActiveChain ? () => setSelectedCardInfo({ cardId: card.id, type: "tableau", colIndex: colIdx, cardIndex: cardIdx }) : undefined}
                    onDragEnd={isContiguousActiveChain ? handleDragEnd : undefined}
                  />
                );
              })}

              {col.length === 0 && (
                <EmptyCard>
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
