import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { StyleSheet, View } from "react-native";
import { useShallow } from "zustand/shallow";

import { useLevelStore } from "@/lib/store/level";
import { theme } from "@/lib/theme";

import Card from "@/components/card";
import type { OnCardDragEnd } from "@/components/card/draggable-card-wrapper";
import EmptyCard from "@/components/card/empty-card";

interface WasteProps {
  handleDragEnd: OnCardDragEnd;
}

export default function Waste({ handleDragEnd }: WasteProps) {
  const { waste, numberOfColumns, setSelectedCardInfo } = useLevelStore(
    useShallow((state) => ({
      waste: state.waste,
      numberOfColumns: state.numberOfColumns,
      setSelectedCardInfo: state.setSelectedCardInfo,
    })),
  );

  const topWasteCard = waste[waste.length - 1];
  const underWasteCard = waste.length > 1 ? waste[waste.length - 2] : null;

  const containerStyles = {
    marginInlineStart: numberOfColumns === 5 ? 39 : undefined,
  };

  if (!topWasteCard) {
    return (
      <View style={[styles.container, containerStyles]}>
        <EmptyCard variant="waste">
          <FontAwesome6 name="layer-group" size={20} color={theme.colors.muted} />
        </EmptyCard>
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyles]}>
      <View style={styles.backgroundLayer}>
        {underWasteCard ? (
          <Card card={underWasteCard} />
        ) : (
          <EmptyCard variant="waste">
            <FontAwesome6 name="layer-group" size={20} color={theme.colors.muted} />
          </EmptyCard>
        )}
      </View>

      <View style={StyleSheet.absoluteFill} key={topWasteCard.id}>
        <Card card={topWasteCard} onDragStart={() => setSelectedCardInfo({ info: { cardId: topWasteCard.id, type: "waste" } })} onDragEnd={handleDragEnd} />
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
