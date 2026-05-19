import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card, { EmptyCard } from "@/components/card";

export default function Foundation() {
  const { numberOfColumns, foundation } = useLevelStore(
    useShallow((state) => ({
      numberOfColumns: state.numberOfColumns,
      foundation: state.foundation,
    })),
  );

  const slots = Array.from({ length: numberOfColumns });

  const activeCategoryKeys = Object.keys(foundation);

  return (
    <View style={styles.foundationRow}>
      {slots.map((_, i) => {
        const categoryKey = activeCategoryKeys[i];
        const stack = categoryKey ? foundation[categoryKey] : null;
        const topCard = stack ? stack[stack.length - 1] : null;

        return (
          <View key={i} style={styles.slot}>
            {topCard ? (
              <Card index={i} card={topCard} onPress={() => {}} />
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
    marginBlockEnd: 15,
    marginInline: 5,
  },
  slot: {
    flex: 1,
    aspectRatio: 2 / 3,
  },
});
