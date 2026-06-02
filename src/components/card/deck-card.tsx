import CardWrapper from "@/components/card/card-wrapper";

interface DeckCardProps {
  isHidden: boolean;
  children?: React.ReactNode;
  onPress: () => void;
}

export default function DeckCard({ isHidden, children, onPress }: DeckCardProps) {
  return (
    <CardWrapper
      variant={isHidden ? "hidden" : "empty"}
      onPress={onPress}>
      {children}
    </CardWrapper>
  );
}
