import { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { BOARD_LAYOUT } from "@/lib/constants";
import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { resolveDropTarget } from "@/lib/utils";
import { LayoutRect } from "@/types";

import ActionBar from "@/components/action-bar";
import EmptyCard from "@/components/card/empty-card";
import Deck from "@/components/deck";
import Foundation from "@/components/foundation";
import TableauColumn from "@/components/tableau-column";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export default function Board() {
  const foundationLayouts = useRef<Array<LayoutRect | null>>([]);
  const tableauLayouts = useRef<Array<LayoutRect | null>>([]);

  const currentLevel = useGameStore((state) => state.currentLevel);
  const { columns, foundation, numberOfColumns, setSelectedCardInfo, moveCard, moveToFoundation, initializeLevel } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      foundation: state.foundation,
      numberOfColumns: state.numberOfColumns,
      setSelectedCardInfo: state.setSelectedCardInfo,
      moveCard: state.moveCard,
      moveToFoundation: state.moveToFoundation,
      initializeLevel: state.initializeLevel,
    })),
  );

  useEffect(() => {
    foundationLayouts.current = Array(numberOfColumns).fill(null);
    tableauLayouts.current = Array(numberOfColumns).fill(null);
    initializeLevel({ currentLevel });
  }, [numberOfColumns]);

  const activeGridColumns = numberOfColumns || 3;
  const currentPadding = BOARD_LAYOUT.MARGIN_INLINE_MAP[activeGridColumns];
  const currentColumnGap = BOARD_LAYOUT.COLUMN_GAP_MAP[activeGridColumns];
  const usableWidth = Math.min(SCREEN_WIDTH - currentPadding, BOARD_LAYOUT.MAX_WIDTH);
  const totalGapsWidth = (activeGridColumns - 1) * currentColumnGap;

  const measuredCardWidth = Math.floor((usableWidth - totalGapsWidth) / activeGridColumns);
  const measuredCardHeight = Math.floor(measuredCardWidth * (3 / 2));

  const cardSize = {
    width: measuredCardWidth,
    height: Math.floor(measuredCardWidth * (3 / 2)),
  };

  const saveLayout = (index: number, type: "foundation" | "tableau") => (event: any) => {
    const targetArray = type === "foundation" ? foundationLayouts.current : tableauLayouts.current;

    event.target.measureInWindow((x: number, y: number, width: number, height: number) => {
      if (width > 0 && height > 0) {
        targetArray[index] = { x, y, width, height };
      }
    });
  };

  function handleDragEnd(absoluteX: number, absoluteY: number) {
    const hitTarget = resolveDropTarget(absoluteX, absoluteY, foundationLayouts.current, tableauLayouts.current);

    if (!hitTarget) {
      setSelectedCardInfo({ info: null });
      return false;
    }

    if (hitTarget.type === "foundation") {
      const success = moveToFoundation({ targetFoundationIndex: hitTarget.index, currentLevel });
      return success;
    }

    const success = moveCard({ targetColumnIndex: hitTarget.index });
    return success;
  }

  return (
    <View style={styles.container}>
      <Deck cardWidth={measuredCardWidth} handleDragEnd={handleDragEnd} />

      <View style={styles.foundationRow}>
        {foundation.map((stack, i) => (
          <View key={i} style={cardSize} onLayout={saveLayout(i, "foundation")}>
            <Foundation stack={stack} />
          </View>
        ))}
      </View>

      <View style={styles.board}>
        <View style={[styles.tableau, { gap: currentColumnGap }]}>
          {columns.map((column, columnIndex) => (
            <View key={columnIndex} style={{ width: measuredCardWidth }} onLayout={saveLayout(columnIndex, "tableau")}>
              {column.map((card, cardIndex) => (
                <TableauColumn key={card.id} card={card} column={column} cardIndex={cardIndex} columnIndex={columnIndex} measuredCardHeight={measuredCardHeight} handleDragEnd={handleDragEnd} />
              ))}

              {column.length === 0 && <EmptyCard />}
            </View>
          ))}
        </View>
      </View>
      <ActionBar />
    </View>
  );
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
  foundationRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBlockStart: 15,
    marginBlockEnd: 30,
    marginInline: 15,
  },
});
