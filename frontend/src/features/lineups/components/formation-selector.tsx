import { cn } from "@/lib/utils";
import { FORMATION_OPTIONS, type Formation } from "@/lib/domain";

interface FormationSelectorProps {
  value: Formation | undefined;
  onChange: (formation: Formation) => void;
  disabled?: boolean;
}

const FORMATION_LAYOUTS: Record<Formation, number[][]> = {
  "3-1": [[0, 0, 0], [0, 0, 1]],
  "2-2": [[0, 0], [0, 0]],
  "2-1-1": [[0, 0], [0], [0]],
  "1-2-1": [[0], [0, 0], [0]],
};

function MiniField({ formation }: { formation: Formation }) {
  const layout = FORMATION_LAYOUTS[formation];

  return (
    <div className="relative h-12 w-16 rounded border border-green-700 bg-green-900/80">
      <div className="absolute inset-0 border border-white/20" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/20" />
      {layout.map((row, rowIdx) => {
        const topPercent = 20 + (rowIdx * 70) / Math.max(layout.length - 1, 1);
        return row.map((_, colIdx) => {
          const leftPercent =
            row.length === 1
              ? 50
              : row.length === 2
                ? colIdx === 0
                  ? 30
                  : 70
                : colIdx === 0
                  ? 20
                  : colIdx === 1
                    ? 50
                    : 80;
          return (
            <div
              key={`${rowIdx}-${colIdx}`}
              className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80"
              style={{
                top: `${topPercent}%`,
                left: `${leftPercent}%`,
              }}
            />
          );
        });
      })}
    </div>
  );
}

export function FormationSelector({
  value,
  onChange,
  disabled,
}: FormationSelectorProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {FORMATION_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-lg border-2 p-3 transition-all",
              selected
                ? "border-primary bg-primary/10"
                : "border-border bg-card hover:border-primary/50 hover:bg-primary/5",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            <MiniField formation={option.value as Formation} />
            <span className="text-xs font-medium">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
