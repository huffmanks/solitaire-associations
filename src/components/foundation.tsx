import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { ComponentRef, RefObject } from "react";
import { StyleSheet, Text, View } from "react-native";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card from "@/components/card";
import EmptyCard from "@/components/card/empty-card";

interface FoundationProps {
  slotRefs: RefObject<Array<ComponentRef<typeof View> | null>>;
}

export default function Foundation({ slotRefs }: FoundationProps) {
  const foundation = useLevelStore((state) => state.foundation);

  return (
    <View style={styles.foundationRow}>
      {Array.isArray(foundation) &&
        foundation.map((stack, i) => {
          const topCard = stack && stack.length > 0 ? stack[stack.length - 1] : null;
          const hasStackedWords = stack && stack.length > 1;

          return (
            <View
              key={i}
              style={styles.slot}
              ref={(ref) => {
                slotRefs.current[i] = ref;
              }}>
              {topCard ? (
                <View style={styles.cardContainer}>
                  {hasStackedWords && (
                    <View style={styles.badgeTab}>
                      <Text style={styles.badgeText} numberOfLines={1}>
                        {topCard.category.toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <Card card={topCard} />
                </View>
              ) : (
                <EmptyCard>
                  <FontAwesome6 name="crown" size={20} color={theme.colors.accent} />
                </EmptyCard>
              )}
            </View>
          );
        })}
    </View>
  );
}

const styles = StyleSheet.create({
  foundationRow: {
    flexDirection: "row",
    gap: 10,
    marginBlockStart: 20,
    marginBlockEnd: 15,
    marginInline: 5,
  },
  slot: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
  cardContainer: {
    flex: 1,
    position: "relative",
  },
  badgeTab: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.primary,
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
    elevation: 4,
  },
  badgeText: {
    color: theme.colors.foreground,
    fontSize: 8,
    fontWeight: "900",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
