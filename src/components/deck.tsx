import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Deck({ deckCount, topWasteCard, onDraw, onWastePress }: any) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onWastePress} style={[styles.slot, !topWasteCard && styles.emptySlot]}>
        {topWasteCard ? (
          <View style={styles.wasteCard}>
            <Text style={styles.cardText}>{topWasteCard.content}</Text>
          </View>
        ) : (
          <Text style={styles.emptyText}>Waste</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onDraw} style={styles.deckStack}>
        <View style={styles.cardBack}>
          <Text style={styles.deckCount}>{deckCount}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  slot: {
    width: 60,
    height: 100,
    borderRadius: 6,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  emptySlot: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderStyle: "dashed",
  },
  wasteCard: {
    width: "100%",
    height: 100,
    backgroundColor: "#ffffff",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  deckStack: {
    width: 60,
    height: 90,
    backgroundColor: "#2c3e50",
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  cardBack: {
    alignItems: "center",
  },
  deckCount: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyText: {
    color: "rgba(255,255,255,0.4)",
    fontSize: 10,
  },
  cardText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#2c3e50",
    textAlign: "center",
    padding: 2,
  },
});
