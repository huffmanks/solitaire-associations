import { CardType } from "@/types";
import { StyleSheet, Text, View } from "react-native";

export default function Foundation({ foundation, columnCount }: { foundation: Record<string, CardType[]>; columnCount: number }) {
  // Create an array the size of columnCount to ensure we show empty slots
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
                {/* Rule: Top Left Symbol */}
                <Text style={styles.symbol}>⭐</Text>

                {/* Rule: Top Right Counter (e.g., 0/5) */}
                <Text style={styles.counter}>
                  {currentCount}/{totalNeeded}
                </Text>

                <Text style={styles.slotText}>{topCard.category}</Text>
                {stack!.length > 1 && <Text style={styles.wordText}>{topCard.content}</Text>}
              </>
            ) : (
              <Text style={styles.emptyText}>Empty</Text>
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
    justifyContent: "space-around",
    paddingVertical: 20,
    paddingHorizontal: 5,
    backgroundColor: "rgba(0,0,0,0.1)", // Light shadow to define the area
    marginBottom: 10,
  },
  slot: {
    height: 100,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    position: "relative", // Necessary for absolute positioning of symbol/counter
  },
  goldBorder: {
    borderColor: "#FFD700",
    borderWidth: 3,
    backgroundColor: "#fff",
    // iOS Shadow
    shadowColor: "#FFD700",
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
    color: "#333",
  },
  slotText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFD700",
    textTransform: "uppercase",
    textAlign: "center",
  },
  wordText: {
    fontSize: 12,
    color: "#2c3e50",
    marginTop: 5,
  },
  emptyText: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 10,
  },
});
