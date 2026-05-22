import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card, { EmptyCard } from "@/components/card";

interface WasteProps {
  onDragEnd: (absoluteX: number, absoluteY: number) => void;
}

export default function Waste({ onDragEnd }: WasteProps) {
  const { waste, setSelectedCardInfo } = useLevelStore(
    useShallow((state) => ({
      waste: state.waste,
      setSelectedCardInfo: state.setSelectedCardInfo,
    })),
  );

  const topWasteCard = waste[waste.length - 1];

  return (
    <View style={styles.container}>
      {!topWasteCard ? (
        <EmptyCard>
          <View>
            <FontAwesome6 name="crown" size={20} color={theme.colors.accent} />
          </View>
        </EmptyCard>
      ) : (
        <Card index={0} card={topWasteCard} onDragStart={() => setSelectedCardInfo({ cardId: topWasteCard.id, type: "waste" })} onDragEnd={onDragEnd} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
