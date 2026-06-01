import Animated, { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated";

import { CARD_COLUMN_VISIBLE_PEEK } from "@/lib/constants";
import { useLevelStore } from "@/lib/store/level";
import { CardType, SpacingVariant } from "@/types";

import Card from "@/components/card";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface TableauColumnProps {
  card: CardType;
  column: Array<CardType>;
  columnIndex: number;
  cardIndex: number;
  measuredCardHeight: number;
  handleDragEnd: OnCardDragEnd;
}

export default function TableauColumn({
  card,
  column,
  columnIndex,
  cardIndex,
  measuredCardHeight,
  handleDragEnd,
}: TableauColumnProps) {
  const setSelectedCardInfo = useLevelStore((state) => state.setSelectedCardInfo);
  const selectedCardInfo = useLevelStore((state) => state.selectedCardInfo);

  const isTopCard = cardIndex === column.length - 1;
  const topCardInColumn = column[column.length - 1];
  const isContiguousActiveChain =
    card.isFaceUp && topCardInColumn && card.category === topCardInColumn.category;

  let stackRootIndex = cardIndex;
  while (
    stackRootIndex > 0 &&
    column[stackRootIndex - 1].isFaceUp &&
    column[stackRootIndex - 1].category === card.category
  ) {
    stackRootIndex--;
  }

  const isThisStackDragging =
    selectedCardInfo !== null &&
    selectedCardInfo.type === "tableau" &&
    selectedCardInfo.columnIndex === columnIndex &&
    cardIndex >= (selectedCardInfo.cardIndex ?? 0);

  const isOvercrowded = column.length > 6;

  const spacingVariant: SpacingVariant = isThisStackDragging
    ? "condensed"
    : isOvercrowded
      ? "small"
      : "default";

  const animatedMarginTop = useDerivedValue(() => {
    if (cardIndex === 0 || measuredCardHeight === 0) {
      return 0;
    }

    const activePeekValue = isThisStackDragging
      ? CARD_COLUMN_VISIBLE_PEEK / 4
      : isOvercrowded
        ? CARD_COLUMN_VISIBLE_PEEK / 2
        : CARD_COLUMN_VISIBLE_PEEK;

    const targetMargin = -(measuredCardHeight - activePeekValue);
    const duration = isThisStackDragging ? 150 : 250;

    return withTiming(targetMargin, { duration });
  }, [cardIndex, measuredCardHeight, isThisStackDragging, isOvercrowded]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    marginTop: animatedMarginTop.value,
  }));

  function handleDragStart() {
    setSelectedCardInfo({
      info: {
        cardId: card.id,
        type: "tableau",
        columnIndex,
        cardIndex: stackRootIndex,
      },
    });
  }

  return (
    <Animated.View style={animatedContainerStyle}>
      <Card
        columnIndex={columnIndex}
        cardIndex={cardIndex}
        stackStartIndex={stackRootIndex}
        card={card}
        isTopCard={isTopCard}
        spacingVariant={spacingVariant}
        onDragStart={isContiguousActiveChain ? handleDragStart : undefined}
        onDragEnd={isContiguousActiveChain ? handleDragEnd : undefined}
      />
    </Animated.View>
  );
}
