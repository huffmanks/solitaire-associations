import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { CARD_COLUMN_VISIBLE_PEEK, GAME_LAYERS, INTRO_ANIMATION } from "@/lib/constants";
import { useLevelStore } from "@/lib/store/level";
import { CardType, SpacingVariant } from "@/types";

import Card from "@/components/card";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";

interface TableauColumnProps {
  card: CardType;
  column: Array<CardType>;
  columnIndex: number;
  cardIndex: number;
  measuredCardWidth: number;
  measuredCardHeight: number;
  handleDragEnd: OnCardDragEnd;
}

export default function TableauColumn({
  card,
  column,
  columnIndex,
  cardIndex,
  measuredCardWidth,
  measuredCardHeight,
  handleDragEnd,
}: TableauColumnProps) {
  const numberOfColumns = useLevelStore((state) => state.numberOfColumns);
  const isGameDealt = useLevelStore((state) => state.isGameDealt);
  const selectedCardInfo = useLevelStore((state) => state.selectedCardInfo);
  const setSelectedCardInfo = useLevelStore((state) => state.setSelectedCardInfo);
  const setIsGameDealt = useLevelStore((state) => state.setIsGameDealt);

  const isFlying = useSharedValue(!isGameDealt);

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
    stackRootIndex === selectedCardInfo.cardIndex &&
    cardIndex >= (selectedCardInfo.cardIndex ?? 0);

  const isOvercrowded = column.length > 7;

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
        ? CARD_COLUMN_VISIBLE_PEEK / 1.5
        : CARD_COLUMN_VISIBLE_PEEK;

    const targetMargin = -(measuredCardHeight - activePeekValue);
    const duration = isThisStackDragging ? 150 : 250;

    return withTiming(targetMargin, { duration });
  }, [cardIndex, measuredCardHeight, isThisStackDragging, isOvercrowded]);

  const globalDealingSequence = cardIndex * numberOfColumns + columnIndex;

  const animatedContainerStyle = useAnimatedStyle(() => {
    let layer = GAME_LAYERS.BASE;

    if (isThisStackDragging) {
      layer = GAME_LAYERS.DRAGGED_STACK_BASE + cardIndex;
    } else if (isFlying.value) {
      layer = GAME_LAYERS.DRAGGED_STACK_BASE + globalDealingSequence;
    } else {
      layer = GAME_LAYERS.BASE + cardIndex;
    }

    return {
      marginTop: animatedMarginTop.value,
      zIndex: layer,
      elevation: isThisStackDragging || isFlying.value ? layer : 0,
    };
  }, [isThisStackDragging, cardIndex, globalDealingSequence]);

  const customFlyInAnimation = () => {
    "worklet";

    if (isGameDealt) {
      return {
        initialValues: {
          opacity: 1,
          transform: [{ translateX: 0 }, { translateY: 0 }],
        },
        animations: {},
      };
    }

    const initialStaggerDelay =
      globalDealingSequence * INTRO_ANIMATION.STAGGER_DELAY + INTRO_ANIMATION.BASE_PARENT_RENDER;

    const columnsFromRightWall = numberOfColumns - 1 - columnIndex;
    const estimatedDistanceToDeckX = columnsFromRightWall * (measuredCardWidth + 12);
    const estimatedDistanceToDeckY = -(measuredCardHeight * 2);

    const animations = {
      opacity: withDelay(
        initialStaggerDelay,
        withTiming(1, { duration: INTRO_ANIMATION.CARD_FLY_DURATION })
      ),
      transform: [
        {
          translateX: withDelay(
            initialStaggerDelay,
            withTiming(0, { duration: INTRO_ANIMATION.CARD_FLY_DURATION })
          ),
        },
        {
          translateY: withDelay(
            initialStaggerDelay,
            withTiming(0, { duration: INTRO_ANIMATION.CARD_FLY_DURATION }, (finished) => {
              if (finished) {
                isFlying.value = false;

                scheduleOnRN(handleGameDealtBridge);
              }
            })
          ),
        },
      ],
    };

    const initialValues = {
      opacity: 0,
      transform: [
        { translateX: estimatedDistanceToDeckX },
        { translateY: estimatedDistanceToDeckY },
      ],
    };

    return {
      initialValues,
      animations,
    };
  };

  function handleGameDealtBridge() {
    setIsGameDealt({ isGameDealt: true });
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
    <Animated.View
      entering={customFlyInAnimation}
      style={animatedContainerStyle}>
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
