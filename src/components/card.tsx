import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useState } from "react";
import { LayoutChangeEvent, Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { CARD_COLUMN_VISIBLE_PEEK } from "@/lib/constants";
import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

interface CardProps {
  card: CardType;
  index: number;
  onPress: () => void;
}

export default function Card({ card, index, onPress }: CardProps) {
  const [cardHeight, setCardHeight] = useState<number>(0);

  const foundation = useLevelStore((state) => state.foundation);

  // TODO for testing
  const selectedCardInfo = useLevelStore((state) => state.selectedCardInfo);

  const isSelected = selectedCardInfo?.cardId === card.id;
  // END TODO

  const stack = foundation[card.category] || null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = card.totalInCategory || 0;

  const dynamicMarginTop = index === 0 || cardHeight === 0 ? 0 : -(cardHeight - CARD_COLUMN_VISIBLE_PEEK);

  const containerStyle: ViewStyle = {
    marginTop: dynamicMarginTop,
    zIndex: index,
  };

  function handleLayout(event: LayoutChangeEvent) {
    const { height } = event.nativeEvent.layout;
    if (height && height !== cardHeight) {
      setCardHeight(height);
    }
  }

  if (!card.isFaceUp) {
    return <CardLayout variant="hidden" isSelected={isSelected} containerStyle={containerStyle} onPress={onPress} onLayout={handleLayout} />;
  }

  if (card.type === "category") {
    return (
      <CardLayout variant="category" isSelected={isSelected} containerStyle={containerStyle} onPress={onPress} onLayout={handleLayout}>
        <View style={styles.categoryHeader}>
          <Text style={styles.text}>{`${currentCount}/${totalNeeded}`}</Text>
          <FontAwesome6 name="crown" size={18} color={theme.colors.primary} />
        </View>
        <Text style={[styles.text, styles.textContent, styles.categoryTextOffset]}>{card.content}</Text>
      </CardLayout>
    );
  }

  return (
    <CardLayout variant="visible" isSelected={isSelected} containerStyle={containerStyle} onPress={onPress} onLayout={handleLayout}>
      <Text style={[styles.text, styles.textContent]}>{card.content}</Text>
    </CardLayout>
  );
}

interface BaseLayoutProps {
  variant: "visible" | "hidden" | "category" | "empty";
  isSelected?: boolean;
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
  onPress?: () => void;
  onLayout?: (event: LayoutChangeEvent) => void;
}

function CardLayout({ variant, isSelected, children, containerStyle, onPress, onLayout }: BaseLayoutProps) {
  const cardStyles = [styles.card, styles[variant], isSelected && styles.selectedOverride];

  function renderPattern() {
    const icons = [];
    const rows = 15;
    const cols = 15;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        icons.push(<MaterialCommunityIcons key={`${r}-${c}`} name="cards-diamond" size={32} color={theme.colors.cardBackIcon} style={styles.patternIcon} />);
      }
    }
    return icons;
  }

  const content = (
    <View style={cardStyles}>
      {variant === "hidden" && (
        <View style={styles.patternContainer} pointerEvents="none">
          <View style={styles.patternGrid}>{renderPattern()}</View>
        </View>
      )}
      <View style={styles.textWrapper}>{children}</View>
    </View>
  );

  if (onPress && onPress.toString() !== "() => {}") {
    return (
      <Pressable style={[styles.baseSize, containerStyle]} onPress={onPress} onLayout={onLayout}>
        {content}
      </Pressable>
    );
  }

  return (
    <View style={[styles.baseSize, containerStyle]} onLayout={onLayout}>
      {content}
    </View>
  );
}

export function EmptyCard({ onPress, children }: { onPress?: () => void; children: React.ReactNode }) {
  return (
    <CardLayout variant="empty" onPress={onPress}>
      {children}
    </CardLayout>
  );
}

export function DeckCard({ children }: { children: React.ReactNode }) {
  const drawCard = useLevelStore((state) => state.drawCard);
  return (
    <CardLayout variant="hidden" onPress={drawCard}>
      {children}
    </CardLayout>
  );
}

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
  selectedOverride: {
    borderColor: "red",
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  visible: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.cardFrontBorder,
  },
  hidden: {
    backgroundColor: theme.colors.cardBack,
    borderColor: theme.colors.foreground,
  },
  category: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.primary,
  },
  empty: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.border,
  },
  categoryHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 4,
  },
  categoryTextOffset: {
    paddingTop: 10,
  },
  text: {
    color: theme.colors.cardForeground,
    fontWeight: "700",
    fontSize: 12,
  },
  textContent: {
    fontSize: 14,
    textAlign: "center",
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
