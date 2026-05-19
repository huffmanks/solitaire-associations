import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";

import Card, { EmptyCard } from "@/components/card";

export default function Foundation() {
  const { columns, foundation } = useLevelStore(
    useShallow((state) => ({
      columns: state.columns,
      foundation: state.foundation,
    })),
  );

  const slots = Array.from({ length: columns.length });

  return (
    <View style={styles.foundationRow}>
      {slots.map((_, i) => {
        const categoryKey = Object.keys(foundation)[i];
        const stack = categoryKey ? foundation[categoryKey] : null;
        const topCard = stack ? stack[stack.length - 1] : null;

        return (
          <View key={i} style={styles.slot}>
            {topCard ? (
              <Card index={i} card={topCard} onPress={() => {}} />
            ) : (
              <EmptyCard>
                <View></View>
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
