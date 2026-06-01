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

  const foundationRefs = useRef<(View | null)[]>([]);
  const tableauRefs = useRef<(View | null)[]>([]);

  const currentLevel = useGameStore((state) => state.currentLevel);
  const {
    columns,
    foundation,
    numberOfColumns,
    setSelectedCardInfo,
    executeCardMove,
    initializeLevel,
  } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      foundation: state.foundation,
      numberOfColumns: state.numberOfColumns,
      setSelectedCardInfo: state.setSelectedCardInfo,
      executeCardMove: state.executeCardMove,
      initializeLevel: state.initializeLevel,
    }))
  );

  useEffect(() => {
    initializeLevel({ currentLevel });
  }, [currentLevel]);

  useEffect(() => {
    measureLayouts();
  }, [columns, foundation]);

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

  function measureLayouts() {
    requestAnimationFrame(() => {
      foundationRefs.current.forEach((ref, i) => {
        if (!ref) return;

        ref.measure((x, y, width, height, pageX, pageY) => {
          foundationLayouts.current[i] = {
            x: pageX,
            y: pageY,
            width,
            height,
          };
        });
      });

      tableauRefs.current.forEach((ref, i) => {
        if (!ref) return;

        ref.measure((x, y, width, height, pageX, pageY) => {
          tableauLayouts.current[i] = {
            x: pageX,
            y: pageY,
            width,
            height,
          };
        });
      });
    });
  }

  function handleDragEnd(absoluteX: number, absoluteY: number) {
    const adjustedY = absoluteY - measuredCardHeight * 0.35;
    const hitTarget = resolveDropTarget(
      absoluteX,
      adjustedY,
      foundationLayouts.current,
      tableauLayouts.current
    );

    if (!hitTarget) {
      setSelectedCardInfo({ info: null });
      return false;
    }

    return executeCardMove({
      currentLevel,
      target: {
        type: hitTarget.type,
        index: hitTarget.index,
      },
    });
  }

  return (
    <View style={styles.container}>
      <Deck
        cardWidth={measuredCardWidth}
        handleDragEnd={handleDragEnd}
      />

      <View style={styles.foundationRow}>
        {foundation.map((stack, i) => (
          <View
            key={i}
            style={cardSize}
            ref={(ref) => {
              foundationRefs.current[i] = ref;
            }}>
            <Foundation stack={stack} />
          </View>
        ))}
      </View>

      <View style={styles.board}>
        <View style={[styles.tableau, { gap: currentColumnGap }]}>
          {columns.map((column, columnIndex) => (
            <View
              key={columnIndex}
              style={{ width: measuredCardWidth }}
              ref={(ref: View | null) => {
                tableauRefs.current[columnIndex] = ref;
              }}>
              <View style={StyleSheet.absoluteFill}>
                <EmptyCard />
              </View>
              {column.map((card, cardIndex) => (
                <TableauColumn
                  key={card.id}
                  card={card}
                  column={column}
                  cardIndex={cardIndex}
                  columnIndex={columnIndex}
                  measuredCardHeight={measuredCardHeight}
                  handleDragEnd={handleDragEnd}
                />
              ))}
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
    marginBlockStart: 25,
    marginBlockEnd: 30,
    marginInline: 15,
  },
});
