import { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { sharedActiveColIndex, sharedActiveDragType, sharedDragSessionId, sharedDragStartIndex, sharedTranslateX, sharedTranslateY } from "@/lib/shared-drag";

export type OnDragEnd = (absoluteX: number, absoluteY: number) => void;

interface DraggableCardWrapperProps {
  columnIndex?: number;
  cardIndex?: number;
  stackStartIndex?: number;
  style: StyleProp<ViewStyle>;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: OnDragEnd;
}

export default function DraggableCardWrapper({ columnIndex, cardIndex, stackStartIndex, containerStyle, style, children, onDragStart, onDragEnd }: DraggableCardWrapperProps) {
  const isDraggingMe = useSharedValue(false);
  const wasDraggedByMe = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => {
    if (isDraggingMe.value) {
      return {
        transform: [{ translateX: sharedTranslateX.value }, { translateY: sharedTranslateY.value }, { scale: 1.02 }],
        zIndex: 9999 + (cardIndex ?? 0),
        elevation: 9999 + (cardIndex ?? 0),
      };
    }

    if (cardIndex !== undefined && columnIndex !== undefined) {
      const isInActiveStack = sharedActiveColIndex.value === columnIndex && sharedDragStartIndex.value !== -1 && cardIndex >= sharedDragStartIndex.value;

      if (isInActiveStack) {
        return {
          transform: [{ translateX: sharedTranslateX.value }, { translateY: sharedTranslateY.value }, { scale: isDraggingMe.value ? 1.02 : 1 }],
          zIndex: 9999 + cardIndex,
          elevation: 9999 + cardIndex,
        };
      }
    }

    if (cardIndex === undefined && wasDraggedByMe.value && (sharedTranslateX.value !== 0 || sharedTranslateY.value !== 0)) {
      return {
        transform: [{ translateX: sharedTranslateX.value }, { translateY: sharedTranslateY.value }, { scale: 1 }],
        zIndex: 9999,
        elevation: 9999,
      };
    }

    return {
      transform: [{ translateX: 0 }, { translateY: 0 }, { scale: 1 }],
      zIndex: containerStyle?.zIndex ?? 0,
      elevation: 0,
    };
  });

  const dragGesture = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      sharedDragSessionId.value += 1;
      wasDraggedByMe.value = true;

      if (columnIndex !== undefined && stackStartIndex !== undefined) {
        sharedActiveColIndex.value = columnIndex;
        sharedDragStartIndex.value = stackStartIndex;
        sharedActiveDragType.value = "tableau";
      } else {
        sharedActiveColIndex.value = -1;
        sharedDragStartIndex.value = -1;
        sharedActiveDragType.value = "waste";
      }

      if (onDragStart) {
        scheduleOnRN(onDragStart);
      }
      isDraggingMe.value = true;
    })
    .onChange((event) => {
      sharedTranslateX.value = event.translationX;
      sharedTranslateY.value = event.translationY;
    })
    .onFinalize((event) => {
      if (onDragEnd) {
        scheduleOnRN(onDragEnd, event.absoluteX, event.absoluteY);
      }

      isDraggingMe.value = false;
      sharedActiveDragType.value = "none";

      const currentSession = sharedDragSessionId.value;

      sharedTranslateX.value = withSpring(0);
      sharedTranslateY.value = withSpring(0, {}, (isFinished) => {
        if (isFinished) {
          wasDraggedByMe.value = false;
          if (sharedDragSessionId.value === currentSession) {
            sharedActiveColIndex.value = -1;
            sharedDragStartIndex.value = -1;
          }
        }
      });
    });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}
