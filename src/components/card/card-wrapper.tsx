import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { memo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { GAME_LAYERS } from "@/lib/constants";
import { theme } from "@/lib/theme";
import { getLockKeyCardColors } from "@/lib/utils";
import { CardVariant, LockColorId, SpacingVariant } from "@/types";

import DraggableCardWrapper, { type OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardWrapperProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  variant: CardVariant;
  spacingVariant?: SpacingVariant;
  isTopCard?: boolean;
  isLock?: boolean;
  isKey?: boolean;
  lockColorId?: LockColorId;
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
  spacingVariant = "default",
  isTopCard,
  isLock,
  isKey,
  lockColorId,
  children,
  onPress,
  onDragStart,
  onDragEnd,
}: CardWrapperProps) {
  const isGestureEnabled = Boolean(onDragStart && onDragEnd);

  const dynamicVariant = lockColorId ? styles[lockColorId] : styles[variant];

  const cardStyles = [styles.card, dynamicVariant];

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

  const lockKeyIndicatorStyles = [
    styles.lockKeyIndicator,
    spacingVariant === "default" && { top: 2 },
    spacingVariant === "small" && { top: 1 },
  ];

  const { lightColor } = getLockKeyCardColors({ lockColorId });

  const content = (
    <View style={cardStyles}>
      {variant === "hidden" && (
        <>
          {isLock || isKey ? (
            <View style={lockKeyIndicatorStyles}>
              <FontAwesome6
                name={isLock ? "lock" : "key"}
                size={spacingVariant === "default" ? 16 : 11}
                color={lightColor}
              />
            </View>
          ) : (
            <View
              style={styles.patternContainer}
              pointerEvents="none">
              <StaticPattern />
            </View>
          )}
        </>
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
        color={theme.colors.cardBackDiamond}
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
  lockKeyIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: GAME_LAYERS.CARD_ACCENT_OVER,
  },
  visible: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.cardFrontBorder,
  },
  red: {
    backgroundColor: theme.colors.redDark,
    borderColor: theme.colors.redBorder,
  },
  orange: {
    backgroundColor: theme.colors.orangeDark,
    borderColor: theme.colors.orangeBorder,
  },
  yellow: {
    backgroundColor: theme.colors.yellowDark,
    borderColor: theme.colors.yellowBorder,
  },
  hidden: {
    backgroundColor: theme.colors.cardBack,
    borderColor: theme.colors.blueButtonRim,
  },
  category: {
    backgroundColor: theme.colors.purpleDark,
    borderColor: theme.colors.purpleBorder,
  },
  empty: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.greenBorder,
  },
  waste: {
    backgroundColor: theme.colors.greenDark,
    borderColor: theme.colors.muted,
  },
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
