import { StyleProp, ViewStyle } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

export type OnDragEnd = (absoluteX: number, absoluteY: number) => void;

interface DraggableCardWrapperProps {
  style: StyleProp<ViewStyle>;
  containerStyle?: ViewStyle;
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: OnDragEnd;
}

export default function DraggableCardWrapper({ containerStyle, style, children, onDragStart, onDragEnd }: DraggableCardWrapperProps) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const isDragging = useSharedValue(false);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: isDragging.value ? 1.02 : 1 }],
    zIndex: isDragging.value ? 999 : containerStyle?.zIndex || 0,
  }));

  const dragGesture = Gesture.Pan()
    .minDistance(4)
    .onBegin(() => {
      if (onDragStart) {
        scheduleOnRN(onDragStart);
      }
      isDragging.value = true;
    })
    .onChange((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onFinalize((event) => {
      if (onDragEnd) {
        scheduleOnRN(onDragEnd, event.absoluteX, event.absoluteY);
      }
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      isDragging.value = false;
    });

  return (
    <GestureDetector gesture={dragGesture}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </GestureDetector>
  );
}
