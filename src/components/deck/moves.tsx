import { StyleSheet, Text, View } from "react-native";

import { useShallow } from "zustand/shallow";

import { BOARD_LAYOUT } from "@/lib/constants";
import { useGameStore } from "@/lib/store/game";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

interface MovesProps {
  cardSize: {
    width: number;
    height: number;
  };
}

export default function Moves({ cardSize }: MovesProps) {
  const { maxMoves, movesCount, numberOfColumns } = useLevelStore(
    useShallow((state) => ({
      maxMoves: state.maxMoves,
      movesCount: state.movesCount,
      numberOfColumns: state.numberOfColumns,
    }))
  );
  const currentLevel = useGameStore((state) => state.currentLevel);

  const currentMoveCount = maxMoves - movesCount;

  const containerStyles = {
    aspectRatio: numberOfColumns === 3 ? 2 / 3 : undefined,
    width:
      numberOfColumns !== 3 && cardSize
        ? cardSize.width * 2 + BOARD_LAYOUT.COLUMN_GAP_MAP[numberOfColumns]
        : undefined,
    height: cardSize.height,
    flexDirection:
      numberOfColumns === 3
        ? "column"
        : ("row" as "column" | "row" | "row-reverse" | "column-reverse" | undefined),
    gap: numberOfColumns === 3 ? 10 : numberOfColumns === 4 ? 50 : 30,
  };

  const textStyles = {
    heading: {
      fontSize: numberOfColumns === 5 ? 13 : 14,
    },
    count: {
      fontSize: numberOfColumns === 5 ? 24 : 28,
    },
  };

  return (
    <View style={[styles.container, containerStyles]}>
      <View style={styles.textWrapper}>
        <Text style={[styles.heading, textStyles.heading]}>Level</Text>
        <Text style={[styles.count, textStyles.count]}>{currentLevel}</Text>
      </View>
      <View style={styles.textWrapper}>
        <Text style={[styles.heading, textStyles.heading]}>Moves</Text>
        <Text style={[styles.count, textStyles.count]}>{currentMoveCount}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.greenDark,
    padding: 5,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: theme.colors.muted,
  },
  textWrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  heading: {
    color: theme.colors.greenButtonRim,
    fontWeight: 700,
  },
  count: {
    color: theme.colors.greenButtonRim,
    fontWeight: 900,
  },
});
