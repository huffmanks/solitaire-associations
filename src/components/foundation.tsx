import { StyleSheet, Text, View } from "react-native";

import { theme } from "@/lib/theme";
import { CardType } from "@/types";

export default function Foundation({ foundation, columnCount }: { foundation: Record<string, CardType[]>; columnCount: number }) {
  const slots = Array.from({ length: columnCount });

  return (
    <View style={styles.foundationRow}>
      {slots.map((_, i) => {
        const categoryKey = Object.keys(foundation)[i];
        const stack = categoryKey ? foundation[categoryKey] : null;
        const topCard = stack ? stack[stack.length - 1] : null;
        const currentCount = stack ? stack.length - 1 : 0;
        const totalNeeded = topCard?.totalInCategory || 0;

        return (
          <View key={i} style={[styles.slot, topCard && styles.goldBorder]}>
            {topCard ? (
              <>
                <Text style={styles.symbol}>⭐</Text>

                <Text style={styles.counter}>
                  {currentCount}/{totalNeeded}
                </Text>

                <Text style={styles.slotText}>{topCard.category}</Text>
                {stack!.length > 1 && <Text style={styles.wordText}>{topCard.content}</Text>}
              </>
            ) : (
              <View style={styles.empty} />
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
    flex: 1,
    gap: 10,
    justifyContent: "space-around",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  slot: {
    height: 100,
    backgroundColor: theme.colors.muted,
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    flex: 1,
  },
  goldBorder: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
    backgroundColor: theme.colors.foreground,
    // iOS Shadow
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    // Android Shadow
    elevation: 8,
  },
  symbol: {
    position: "absolute",
    top: 4,
    left: 4,
    fontSize: 12,
  },
  counter: {
    position: "absolute",
    top: 4,
    right: 4,
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.cardForeground,
  },
  slotText: {
    fontSize: 10,
    fontWeight: "bold",
    color: theme.colors.secondary,
    textTransform: "uppercase",
    textAlign: "center",
  },
  wordText: {
    fontSize: 12,
    color: theme.colors.cardForeground,
    marginTop: 5,
  },
  empty: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    backgroundColor: theme.colors.border,
  },
});
