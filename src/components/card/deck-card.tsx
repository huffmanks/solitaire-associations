import { useLevelStore } from "@/lib/store/level";

import CardWrapper from "@/components/card/card-wrapper";

export default function DeckCard({ isHidden, children }: { isHidden: boolean; children?: React.ReactNode }) {
  const drawCard = useLevelStore((state) => state.drawCard);

  return (
    <CardWrapper variant={isHidden ? "hidden" : "empty"} onPress={drawCard}>
      {children}
    </CardWrapper>
  );
}
