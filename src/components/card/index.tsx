import { useLevelStore } from "@/lib/store/level";
import { CardType, SpacingVariant } from "@/types";

import {
  CategoryCardContent,
  LockCardContent,
  VisibleCardContent,
} from "@/components/card/card-content";
import CardWrapper from "@/components/card/card-wrapper";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface CardProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  card: CardType;
  isTopCard?: boolean;
  spacingVariant?: SpacingVariant;
  onDragStart?: () => void;
  onDragEnd?: OnCardDragEnd;
}

export default function Card({
  columnIndex,
  cardIndex,
  stackStartIndex,
  card,
  isTopCard = true,
  spacingVariant = "default",
  onDragStart,
  onDragEnd,
}: CardProps) {
  const foundation = useLevelStore((state) => state.foundation);
  const numberOfColumns = useLevelStore((state) => state.numberOfColumns);

  const stack = Array.isArray(foundation)
    ? foundation.find(
        (slot) => slot !== null && slot.length > 0 && slot[0].category === card.category
      ) || null
    : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = card.totalInCategory || 0;

  const categoryCrownSize = numberOfColumns === 5 ? 12 : numberOfColumns === 4 ? 15 : 18;

  const dynamicStyles = {
    categoryTextCount: {
      fontSize: numberOfColumns === 5 ? 9 : numberOfColumns === 4 ? 11 : 12,
    },
    baseTextContent: {
      fontSize: numberOfColumns === 5 ? 11 : numberOfColumns === 4 ? 13 : 14,
    },
    peekTextOffset: {
      fontSize: spacingVariant === "small" ? 8 : numberOfColumns === 3 ? 11 : 10,
      lineHeight: spacingVariant === "small" ? 9 : 12,
      display: spacingVariant === "condensed" ? ("none" as const) : ("flex" as const),
    },
  };

  if (!card.isFaceUp) {
    return (
      <CardWrapper
        columnIndex={columnIndex}
        cardIndex={cardIndex}
        stackStartIndex={stackStartIndex}
        variant="hidden"
        spacingVariant={spacingVariant}
        isLock={card.isLock}
        isKey={card.isKey}
        lockColorId={card.lockColorId}
      />
    );
  }

  const cardVariant =
    card.lockColorId === "red"
      ? "red"
      : card.lockColorId === "orange"
        ? "orange"
        : card.lockColorId === "yellow"
          ? "yellow"
          : card.type === "category"
            ? "category"
            : "visible";

  return (
    <CardWrapper
      columnIndex={columnIndex}
      cardIndex={cardIndex}
      stackStartIndex={stackStartIndex}
      variant={cardVariant}
      spacingVariant={spacingVariant}
      isTopCard={isTopCard}
      onDragStart={card.isLock ? undefined : onDragStart}
      onDragEnd={card.isLock ? undefined : onDragEnd}>
      {card.isLock ? (
        <LockCardContent card={card} />
      ) : card.type === "category" ? (
        <CategoryCardContent
          card={card}
          currentCount={currentCount}
          totalNeeded={totalNeeded}
          categoryCrownSize={categoryCrownSize}
          dynamicStyles={dynamicStyles}
        />
      ) : (
        <VisibleCardContent
          card={card}
          isTopCard={isTopCard}
          dynamicStyles={dynamicStyles}
        />
      )}
    </CardWrapper>
  );
}
