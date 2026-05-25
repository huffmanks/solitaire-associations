import { LayoutChangeEvent, ViewStyle } from "react-native";

import { CARD_COLUMN_VISIBLE_PEEK } from "@/lib/constants";

import { useLevelStore } from "@/lib/store/level";
import { CardType } from "@/types";

import Card from "@/components/card";
import type { OnDragEnd } from "@/components/card/draggable-card-wrapper";

interface TableauColumnProps {
  card: CardType;
  column: Array<CardType>;
  colIndex: number;
  cardIndex: number;
  measuredCardHeight: number;
  handleDragEnd: OnDragEnd;
  handleFirstCardLayout: (event: LayoutChangeEvent) => void;
}

export default function TableauColumn({ card, column, colIndex, cardIndex, measuredCardHeight, handleDragEnd, handleFirstCardLayout }: TableauColumnProps) {
  const setSelectedCardInfo = useLevelStore((state) => state.setSelectedCardInfo);

  const isTopCard = cardIndex === column.length - 1;
  const topCardInColumn = column[column.length - 1];
  const isContiguousActiveChain = card.isFaceUp && topCardInColumn && card.category === topCardInColumn.category;

  const dynamicMarginTop = cardIndex === 0 || measuredCardHeight === 0 ? 0 : -(measuredCardHeight - CARD_COLUMN_VISIBLE_PEEK);

  const containerStyle: ViewStyle = {
    marginTop: dynamicMarginTop,
  };

  function handleDragStart() {
    setSelectedCardInfo({ info: { cardId: card.id, type: "tableau", colIndex, cardIndex } });
  }

  // TODO
  // const isContiguousActiveChain = (() => {
  //         if (!card.isFaceUp || !topCardInColumn || card.category !== topCardInColumn.category) {
  //           return false;
  //         }

  //         for (let i = cardIndex; i < column.length; i++) {
  //           const current = col[i];
  //           if (!current.isFaceUp || current.category !== topCardInColumn.category) {
  //             return false;
  //           }
  //         }

  //         return true;
  //       })();

  return (
    <Card
      card={card}
      isTopCard={isTopCard}
      containerStyle={containerStyle}
      onLayout={colIndex === 0 && cardIndex === 0 ? handleFirstCardLayout : undefined}
      onDragStart={isContiguousActiveChain ? handleDragStart : undefined}
      onDragEnd={isContiguousActiveChain ? handleDragEnd : undefined}
    />
  );
}
