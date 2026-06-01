import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { theme } from "@/lib/theme";
import { CardVariant, SpacingVariant } from "@/types";

import DraggableCardWrapper, { type OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardWrapperProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  variant: CardVariant;
  spacingVariant?: SpacingVariant;
  isTopCard?: boolean;
  children?: React.ReactNode;
  onPress?: () => void;
  onDragStart?: () => void;
  onDragEnd?: OnCardDragEnd;
}

export default function CardWrapper({
  columnIndex,
  cardIndex,
  stackStartIndex,
  variant,
  isTopCard,
  children,
  spacingVariant,
  onPress,
  onDragStart,
  onDragEnd,
}: CardWrapperProps) {
  const isGestureEnabled = Boolean(onDragStart && onDragEnd);

  const cardStyles = [styles.card, styles[variant]];

  const textWrapperStyles = [
    styles.textWrapper,
    !isTopCard &&
      variant !== "hidden" &&
      variant !== "empty" &&
      variant !== "waste" && [
        styles.textWrapperPeekOverride,
        spacingVariant === "default" && { paddingTop: 4 },
      ],
  ];

  const content = (
    <View style={cardStyles}>
      {variant === "hidden" && (
        <View
          style={styles.patternContainer}
          pointerEvents="none">
          <StaticPattern />
        </View>
      )}
      <View style={textWrapperStyles}>{children}</View>
    </View>
  );

  if (isGestureEnabled) {
    return (
      <View style={styles.baseSize}>
        <DraggableCardWrapper
          columnIndex={columnIndex}
          cardIndex={cardIndex}
          stackStartIndex={stackStartIndex}
          style={{ flex: 1 }}
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}>
          {content}
        </DraggableCardWrapper>
      </View>
    );
  }

  if (onPress) {
    return (
      <Pressable
        style={styles.baseSize}
        onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.baseSize}>{content}</View>;
}

const StaticPattern = memo(function StaticPattern() {
  const rows = 6;
  const cols = 6;

  const singleRow = [];
  for (let c = 0; c < cols; c++) {
    singleRow.push(
      <MaterialCommunityIcons
        key={`c-${c}`}
        name="cards-diamond"
        size={32}
        color={theme.colors.blueDark}
        style={styles.patternIcon}
      />
    );
  }

  const grid = [];
  for (let r = 0; r < rows; r++) {
    grid.push(
      <View
        key={`r-${r}`}
        style={{ flexDirection: "row" }}>
        {singleRow}
      </View>
    );
  }

  return <View style={styles.patternGrid}>{grid}</View>;
});

const styles = StyleSheet.create({
  baseSize: {
    width: "100%",
    aspectRatio: 2 / 3,
  },
  card: {
    flex: 1,
    borderWidth: 3,
    borderStyle: "solid",
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    overflow: "hidden",
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  textWrapperPeekOverride: {
    justifyContent: "flex-start",
  },
  visible: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.cardFrontBorder,
  },
  hidden: {
    backgroundColor: theme.colors.blueLight,
    borderColor: theme.colors.foreground,
  },
  category: {
    backgroundColor: theme.colors.categoryCardFront,
    borderColor: theme.colors.categoryCardFrontBorder,
  },
  empty: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.greenBorder,
  },
  waste: {
    backgroundColor: theme.colors.greenDark,
    borderColor: theme.colors.muted,
  },
  deck: {},
  patternContainer: {
    ...StyleSheet.absoluteFill,
    overflow: "hidden",
  },
  patternGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    width: 200,
    height: 200,
  },
  patternIcon: {
    marginInline: -6,
    marginBlock: -4,
    lineHeight: 32,
  },
});
