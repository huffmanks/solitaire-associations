import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card, { EmptyCard } from "@/components/card";

export default function Waste() {
  const { waste, setSelectedCardInfo } = useLevelStore(
    useShallow((state) => ({
      waste: state.waste,
      setSelectedCardInfo: state.setSelectedCardInfo,
    })),
  );

  const topWasteCard = waste[waste.length - 1];

  function handleWastePress() {
    if (waste.length > 0) {
      setSelectedCardInfo({ type: "waste" });
    }
  }

  return (
    <View style={styles.container}>
      {!topWasteCard ? (
        <EmptyCard>
          <View>
            <FontAwesome6 name="crown" size={20} color={theme.colors.accent} />
          </View>
        </EmptyCard>
      ) : (
        <Card index={0} card={topWasteCard} onPress={handleWastePress} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
