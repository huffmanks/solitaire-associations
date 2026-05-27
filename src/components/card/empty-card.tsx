import { CardVariants } from "@/types";

import CardWrapper from "@/components/card/card-wrapper";

interface EmptyCardProps {
  variant?: CardVariants;
  children?: React.ReactNode;
}

export default function EmptyCard({ variant = "empty", children }: EmptyCardProps) {
  return <CardWrapper variant={variant}>{children}</CardWrapper>;
}
