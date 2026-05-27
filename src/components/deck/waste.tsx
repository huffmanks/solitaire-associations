import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card from "@/components/card";
import type { OnDragEnd } from "@/components/card/draggable-card-wrapper";
import EmptyCard from "@/components/card/empty-card";

interface WasteProps {
  onDragEnd: OnDragEnd;
}

export default function Waste({ onDragEnd }: WasteProps) {
  const { waste, setSelectedCardInfo } = useLevelStore(
    useShallow((state) => ({
      waste: state.waste,
      setSelectedCardInfo: state.setSelectedCardInfo,
    })),
  );

  const topWasteCard = waste[waste.length - 1];
  const underWasteCard = waste.length > 1 ? waste[waste.length - 2] : null;

  if (!topWasteCard) {
    return (
      <View style={styles.container}>
        <EmptyCard>
          <FontAwesome6 name="layer-group" size={20} color={theme.colors.greenLight} />
        </EmptyCard>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.backgroundLayer}>
        {underWasteCard ? (
          <Card card={underWasteCard} />
        ) : (
          <EmptyCard>
            <FontAwesome6 name="crown" size={20} color={theme.colors.greenLight} />
          </EmptyCard>
        )}
      </View>

      <View style={StyleSheet.absoluteFill} key={topWasteCard.id}>
        <Card card={topWasteCard} onDragStart={() => setSelectedCardInfo({ info: { cardId: topWasteCard.id, type: "waste" } })} onDragEnd={onDragEnd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    position: "relative",
  },
  backgroundLayer: {
    width: "100%",
    height: "100%",
  },
});
