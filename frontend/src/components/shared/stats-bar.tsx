interface StatsBarProps {
  total: number;
  free?: number;
  withClub?: number;
}

export function StatsBar({ total, free, withClub }: StatsBarProps) {
  return (
    <div className="flex items-center gap-4 text-sm">
      <span className="font-medium text-foreground">
        Todos <span className="text-muted-foreground">{total}</span>
      </span>
      {free !== undefined && (
        <span className="text-muted-foreground">
          Livres <span className="font-medium text-foreground">{free}</span>
        </span>
      )}
      {withClub !== undefined && (
        <span className="text-muted-foreground">
          Em clubes <span className="font-medium text-foreground">{withClub}</span>
        </span>
      )}
    </div>
  );
}
