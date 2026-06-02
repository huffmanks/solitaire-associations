import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

import { GAME_LAYERS } from "@/lib/constants";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card from "@/components/card";
import DeckCard from "@/components/card/deck-card";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";
import Moves from "@/components/deck/moves";
import Waste from "@/components/deck/waste";

interface DeckProps {
  cardWidth: number;
  handleDragEnd: OnCardDragEnd;
}

export default function Deck({ cardWidth, handleDragEnd }: DeckProps) {
  const [animatingCard, setAnimatingCard] = useState<any | null>(null);

  const deck = useLevelStore((state) => state.deck);
  const drawCard = useLevelStore((state) => state.drawCard);

  const animationProgress = useSharedValue<number>(0);
  const overlayOpacity = useSharedValue<number>(0);

  const cardSize = {
    width: cardWidth,
    height: Math.floor(cardWidth * (3 / 2)),
  };

  function handleDrawCardBridge() {
    drawCard();
    setAnimatingCard(null);
  }

  function handleDeckPress() {
    if (deck.length === 0) {
      drawCard();
      return;
    }

    const topCard = deck[deck.length - 1];
    setAnimatingCard(topCard);
    animationProgress.value = 0;
    overlayOpacity.value = 1;

    animationProgress.value = withTiming(1, { duration: 200 }, (isFinished) => {
      if (isFinished) {
        scheduleOnRN(handleDrawCardBridge);
        setTimeout(() => {
          overlayOpacity.value = 0;
        }, 50);
      }
    });
  }

  const animatedCardStyle = useAnimatedStyle(() => {
    const translateX = animationProgress.value * (-cardWidth - 15);
    const rotateY = `${180 - animationProgress.value * 180}deg`;

    return {
      opacity: overlayOpacity.value,
      transform: [{ translateX }, { rotateY }],
    };
  });

  return (
    <View style={styles.container}>
      <View>
        <Moves cardSize={cardSize} />
      </View>

      <View style={cardSize}>
        <Waste handleDragEnd={handleDragEnd} />
      </View>

      <View style={[cardSize, { position: "relative" }]}>
        <DeckCard
          isHidden={deck.length > 0}
          onPress={handleDeckPress}>
          {deck.length > 0 ? (
            <Text style={styles.deckCount}>{deck.length}</Text>
          ) : (
            <View style={styles.recycleCenter}>
              <FontAwesome6
                name="rotate-left"
                size={20}
                color={theme.colors.greenLight}
              />
            </View>
          )}
        </DeckCard>

        {animatingCard && (
          <Animated.View
            style={[StyleSheet.absoluteFill, cardSize, styles.movingCardLayer, animatedCardStyle]}>
            <Card card={{ ...animatingCard, isFaceUp: true }} />
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBlockStart: 15,
    marginBlockEnd: 10,
    marginInline: 15,
  },
  deckCount: {
    color: theme.colors.foreground,
    fontWeight: "900",
  },
  recycleCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  movingCardLayer: {
    zIndex: GAME_LAYERS.CARD_EFFECT,
    pointerEvents: "none",
    backfaceVisibility: "hidden",
  },
});
