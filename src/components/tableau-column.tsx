import { ViewStyle } from "react-native";

import { CARD_COLUMN_VISIBLE_PEEK } from "@/lib/constants";
import { useLevelStore } from "@/lib/store/level";
import { CardType } from "@/types";

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

  const isTopCard = cardIndex === column.length - 1;
  const topCardInColumn = column[column.length - 1];
  const isContiguousActiveChain =
    card.isFaceUp && topCardInColumn && card.category === topCardInColumn.category;

  const dynamicMarginTop =
    cardIndex === 0 || measuredCardHeight === 0
      ? 0
      : -(measuredCardHeight - CARD_COLUMN_VISIBLE_PEEK);

  const containerStyle: ViewStyle = {
    marginTop: dynamicMarginTop,
  };

  let stackRootIndex = cardIndex;
  while (
    stackRootIndex > 0 &&
    column[stackRootIndex - 1].isFaceUp &&
    column[stackRootIndex - 1].category === card.category
  ) {
    stackRootIndex--;
  }

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
    <Card
      columnIndex={columnIndex}
      cardIndex={cardIndex}
      stackStartIndex={stackRootIndex}
      card={card}
      isTopCard={isTopCard}
      containerStyle={containerStyle}
      onDragStart={isContiguousActiveChain ? handleDragStart : undefined}
      onDragEnd={isContiguousActiveChain ? handleDragEnd : undefined}
    />
  );
}
