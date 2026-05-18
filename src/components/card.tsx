import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";
import { CardType } from "@/types";

interface CardProps {
  card: CardType;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

export default function Card({ card, index, isSelected, onPress }: CardProps) {
  const foundation = useLevelStore((state) => state.foundation);

  const categoryKey = Object.keys(foundation)[index];
  const stack = categoryKey ? foundation[categoryKey] : null;
  const topCard = stack ? stack[stack.length - 1] : null;
  const currentCount = stack ? stack.length - 1 : 0;
  const totalNeeded = topCard?.totalInCategory || 0;

  const cardStyle = {
    marginTop: index === 0 ? 0 : -60,
    zIndex: index,
  };

  return (
    <Pressable style={cardStyle} onPress={onPress}>
      <View style={styles.container}>
        {card.isFaceUp ? (
          <>
            {card.type === "category" ? (
              <CategoryCard cardContent={card.content} currentCount={currentCount} totalNeeded={totalNeeded} />
            ) : (
              <View style={[styles.card, styles.visible]}>
                <View style={styles.textWrapper}>
                  <Text style={[styles.text, styles.textContent]}>{card.content}</Text>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={[styles.card, styles.hidden]} />
        )}
      </View>
    </Pressable>
  );
}

function CategoryCard({ cardContent, currentCount, totalNeeded }: { cardContent: string; currentCount: number; totalNeeded: number }) {
  return (
    <View style={[styles.card, styles.category]}>
      <View style={styles.categoryHeader}>
        <Text style={styles.text}>
          {currentCount}/{totalNeeded}
        </Text>
        <FontAwesome6 name="crown" size={20} color={theme.colors.primary} />
      </View>
      <View style={[styles.textWrapper, styles.categoryTextWrapper]}>
        <Text style={[styles.text, styles.textContent]}>{cardContent}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    aspectRatio: 2 / 3,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 60,
  },
  card: {
    flex: 1,
    borderWidth: 3,
    borderStyle: "solid",
    borderRadius: 10,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
  },
  hidden: {
    backgroundColor: theme.colors.cardBack,
    borderColor: theme.colors.foreground,
  },
  visible: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.cardForeground,
  },
  category: {
    backgroundColor: theme.colors.cardFront,
    borderColor: theme.colors.primary,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 5,
  },
  textWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryTextWrapper: {
    paddingBlockEnd: 30,
  },
  text: {
    color: theme.colors.cardForeground,
    fontWeight: 700,
  },
  textContent: {
    fontSize: 20,
  },
});
