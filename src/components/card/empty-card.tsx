import CardWrapper from "@/components/card/card-wrapper";

export default function EmptyCard({ children }: { children?: React.ReactNode }) {
  return <CardWrapper variant="empty">{children}</CardWrapper>;
}
