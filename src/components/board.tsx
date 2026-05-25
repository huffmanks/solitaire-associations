import { ComponentRef, useEffect, useRef } from "react";
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { BOARD_LAYOUT } from "@/lib/constants";
import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { isPointInside } from "@/lib/utils";
import { DropTargetHit } from "@/types";

import EmptyCard from "@/components/card/empty-card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import GameOverModal from "@/components/modals/game-over";
import TableauColumn from "@/components/tableau-column";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Board() {
  const tableauRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);
  const foundationRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);

  const currentLevel = useGameStore((state) => state.currentLevel);
  const { columns, setSelectedCardInfo, moveCard, moveToFoundation, initializeLevel, numberOfColumns } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
      moveToFoundation: state.moveToFoundation,
      initializeLevel: state.initializeLevel,
      numberOfColumns: state.numberOfColumns,
    })),
  );

  useEffect(() => {
    initializeLevel({ currentLevel });
  }, []);

  const activeGridColumns = numberOfColumns || 3;
  const currentPadding = BOARD_LAYOUT.MARGIN_INLINE_MAP[activeGridColumns];
  const currentColumnGap = BOARD_LAYOUT.COLUMN_GAP_MAP[activeGridColumns];
  const usableWidth = Math.min(SCREEN_WIDTH - currentPadding, BOARD_LAYOUT.MAX_WIDTH);
  const totalGapsWidth = (activeGridColumns - 1) * currentColumnGap;

  const measuredCardWidth = Math.floor((usableWidth - totalGapsWidth) / activeGridColumns);
  const measuredCardHeight = Math.floor(measuredCardWidth * (3 / 2));

  // TODO remove
  function handleFirstCardLayout(event: LayoutChangeEvent) {}

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
      setSelectedCardInfo({ info: null });
      return;
    }

    if (hitTarget.type === "foundation") {
      moveToFoundation({ targetFoundationIndex: hitTarget.index, currentLevel });
      return;
    }

    moveCard({ targetColIndex: hitTarget.index });
  }
  return (
    <View style={styles.container}>
      <Deck cardWidth={measuredCardWidth} onCardDragEnd={handleDragEnd} />
      <Foundation slotRefs={foundationRefs} cardWidth={measuredCardWidth} />

      <View style={styles.board}>
        <View style={[styles.tableau, { gap: currentColumnGap }]}>
          {columns.map((column, colIndex) => (
            <View
              key={colIndex}
              style={{ width: measuredCardWidth }}
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
    width: "100%",
  },
  board: {
    flex: 1,
    marginInline: 15,
  },
  tableau: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
});
