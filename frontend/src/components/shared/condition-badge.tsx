import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS, type Condition } from "@/lib/domain";

const CONDITION_CONFIG: Record<Condition, { variant: "success" | "warning" | "destructive"; dotColor: string }> = {
  APTO: { variant: "success", dotColor: "bg-success" },
  MAL_CONDICIONADO: { variant: "warning", dotColor: "bg-warning" },
  DOENTE: { variant: "destructive", dotColor: "bg-destructive" },
};

export function ConditionBadge({ condition }: { condition: Condition }) {
  const config = CONDITION_CONFIG[condition];
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor}`} />
      {CONDITION_LABELS[condition]}
    </Badge>
  );
}
