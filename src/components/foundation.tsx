import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card, { EmptyCard } from "@/components/card";

export default function Foundation() {
  const { foundation, moveToFoundation } = useLevelStore(
    useShallow((state) => ({
      foundation: state.foundation,
      moveToFoundation: state.moveToFoundation,
    })),
  );

  return (
    <View style={styles.foundationRow}>
      {Array.isArray(foundation) &&
        foundation.map((stack, i) => {
          const topCard = stack && stack.length > 0 ? stack[stack.length - 1] : null;

          return (
            <View key={i} style={styles.slot}>
              {topCard ? (
                <Card index={0} card={topCard} onPress={() => moveToFoundation(i)} />
              ) : (
                <EmptyCard
                  // TODO check if needed
                  onPress={() => moveToFoundation(i)}>
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
    marginBlockEnd: 15,
    marginInline: 5,
  },
  slot: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
});
