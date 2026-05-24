import { ComponentRef, useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { isPointInside } from "@/lib/utils";
import { DropTargetHit } from "@/types";

import EmptyCard from "@/components/card/empty-card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import GameOverModal from "@/components/modals/game-over";
import TableauColumn from "@/components/tableau-column";

export default function Board() {
  const [measuredCardHeight, setMeasuredCardHeight] = useState<number>(0);

  const tableauRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);
  const foundationRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);

  const { columns, setSelectedCardInfo, moveCard, moveToFoundation, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
      moveToFoundation: state.moveToFoundation,
      initializeLevel: state.initializeLevel,
    })),
  );

  useEffect(() => {
    initializeLevel();
  }, []);

  function handleFirstCardLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    if (height && measuredCardHeight === 0) {
      setMeasuredCardHeight(height);
    }
  }

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
          {columns.map((column, colIndex) => (
            <View
              key={colIndex}
              style={styles.column}
              ref={(ref) => {
                tableauRefs.current[colIndex] = ref;
              }}>
              {column.map((card, cardIndex) => (
                <TableauColumn
                  key={card.id}
                  card={card}
                  column={column}
                  cardIndex={cardIndex}
                  colIndex={colIndex}
                  measuredCardHeight={measuredCardHeight}
                  handleDragEnd={handleDragEnd}
                  handleFirstCardLayout={handleFirstCardLayout}
                />
              ))}

              {column.length === 0 && <EmptyCard />}
            </View>
          ))}
        </View>
      </View>
      <GameOverModal />
    </View>
  );
}

function measureView(ref: ComponentRef<typeof View> | null) {
  return new Promise<{ x: number; y: number; width: number; height: number } | null>((resolve) => {
    if (!ref || typeof ref.measureInWindow !== "function") {
      resolve(null);
      return;
    }

    ref.measureInWindow((x, y, width, height) => resolve({ x, y, width, height }));
  });
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
