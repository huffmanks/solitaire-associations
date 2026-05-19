import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, StyleSheet, Text, View, ViewStyle } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

interface CardProps {
  card: CardType;
  index: number;
  onPress: () => void;
}

export default function Card({ card, index, onPress }: CardProps) {
  const foundation = useLevelStore((state) => state.foundation);

  const categoryKey = Object.keys(foundation)[index];
  const stack = categoryKey ? foundation[categoryKey] : null;
  const topCard = stack ? stack[stack.length - 1] : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = topCard?.totalInCategory || 0;

  const containerStyle: ViewStyle = {
    marginTop: index === 0 ? 0 : -175,
    zIndex: index,
  };

  if (!card.isFaceUp) {
    return <CardLayout variant="hidden" containerStyle={containerStyle} onPress={onPress} />;
  }

  if (card.type === "category") {
    return (
      <CardLayout variant="category" containerStyle={containerStyle} onPress={onPress}>
        <View style={styles.categoryHeader}>
          <Text style={styles.text}>{`${currentCount}/${totalNeeded}`}</Text>
          <FontAwesome6 name="crown" size={18} color={theme.colors.primary} />
        </View>
        <Text style={[styles.text, styles.textContent, styles.categoryTextOffset]}>{card.content}</Text>
      </CardLayout>
    );
  }

  return (
    <CardLayout variant="visible" containerStyle={containerStyle} onPress={onPress}>
      <Text style={[styles.text, styles.textContent]}>{card.content}</Text>
    </CardLayout>
  );
}

interface BaseLayoutProps {
  variant: "visible" | "hidden" | "category" | "empty";
  children?: React.ReactNode;
  containerStyle?: ViewStyle;
  onPress?: () => void;
}

function CardLayout({ variant, children, containerStyle, onPress }: BaseLayoutProps) {
  const cardStyles = [styles.card, styles[variant]];

  const content = (
    <View style={cardStyles}>
      <View style={styles.textWrapper}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable style={[styles.baseSize, containerStyle]} onPress={onPress}>
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.baseSize, containerStyle]}>{content}</View>;
}

export function EmptyCard({ children }: { children: React.ReactNode }) {
  return <CardLayout variant="empty">{children}</CardLayout>;
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
  textWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  visible: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.cardForeground,
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
});
