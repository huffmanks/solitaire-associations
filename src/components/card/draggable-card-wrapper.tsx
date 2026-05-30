import { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { sharedActiveColIndex, sharedDragStartIndex, sharedTranslateX, sharedTranslateY } from "@/lib/shared-drag";

export type OnCardDragEnd = (absoluteX: number, absoluteY: number) => boolean;

interface DraggableCardWrapperProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  style: StyleProp<ViewStyle>;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: OnCardDragEnd;
}

export default function DraggableCardWrapper({ columnIndex, cardIndex, stackStartIndex, style, children, onDragStart, onDragEnd }: DraggableCardWrapperProps) {
  const isDragging = useSharedValue(false);
  const scale = useSharedValue(1);
  const shakeOffset = useSharedValue(0);

  function triggerErrorShake() {
    shakeOffset.value = withDelay(
      100,
      withSequence(
        withTiming(-4, { duration: 25 }),
        withTiming(4, { duration: 25 }),
        withTiming(-3, { duration: 25 }),
        withTiming(3, { duration: 25 }),
        withTiming(-1.5, { duration: 25 }),
        withTiming(1.5, { duration: 25 }),
        withTiming(0, { duration: 25 }),
      ),
    );
  }

  function handleOnDragEndBridge(x: number, y: number) {
    if (onDragEnd) {
      const isValidMove = onDragEnd(x, y);
      if (isValidMove) {
        sharedTranslateX.value = 0;
        sharedTranslateY.value = 0;
        scale.value = withSpring(1);
        sharedActiveColIndex.value = -1;
        sharedDragStartIndex.value = -1;
        isDragging.value = false;
      } else {
        triggerErrorShake();
        sharedTranslateX.value = withSpring(0, {
          damping: 22,
          stiffness: 260,
          mass: 0.7,
          overshootClamping: true,
        });
        sharedTranslateY.value = withSpring(0, {
          damping: 22,
          stiffness: 260,
          mass: 0.7,
          overshootClamping: true,
        });
        scale.value = withSpring(1);

        setTimeout(() => {
          sharedActiveColIndex.value = -1;
          sharedDragStartIndex.value = -1;
          isDragging.value = false;
        }, 200);
      }
    } else {
      sharedTranslateX.value = withSpring(0);
      sharedTranslateY.value = withSpring(0);
      scale.value = withSpring(1);
      isDragging.value = false;
    }
  }

  const animatedStyle = useAnimatedStyle(() => {
    const isInDraggedStack =
      columnIndex !== undefined && cardIndex !== undefined && sharedActiveColIndex.value === columnIndex && sharedDragStartIndex.value !== -1 && cardIndex >= sharedDragStartIndex.value;

    if (isDragging.value || isInDraggedStack) {
      return {
        transform: [{ translateX: sharedTranslateX.value + shakeOffset.value }, { translateY: sharedTranslateY.value }, { scale: scale.value }],
        zIndex: 99999 + (cardIndex ?? 0),
        elevation: 99999 + (cardIndex ?? 0),
      };
    }

    return {
      transform: [{ translateX: shakeOffset.value }, { translateY: 0 }, { scale: 1 }],
      zIndex: 1,
      elevation: 0,
    };
  });

  const dragGesture = Gesture.Pan()
    .minDistance(2)
    .onBegin(() => {
      isDragging.value = true;
      scale.value = withSpring(1.03);

      if (columnIndex !== undefined && stackStartIndex !== undefined) {
        sharedActiveColIndex.value = columnIndex;
        sharedDragStartIndex.value = stackStartIndex;
      }

      if (onDragStart) {
        scheduleOnRN(onDragStart);
      }
    })
    .onUpdate((event) => {
      sharedTranslateX.value = event.translationX;
      sharedTranslateY.value = event.translationY;
    })
    .onFinalize((event) => {
      if (onDragEnd) {
        scheduleOnRN(handleOnDragEndBridge, event.absoluteX, event.absoluteY);
      }
    });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}
