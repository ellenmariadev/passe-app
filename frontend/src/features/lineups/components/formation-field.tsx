import { cn } from "@/lib/utils";
import type { Formation } from "@/lib/domain";

interface FormationPlayer {
  id?: number | string;
  name?: string;
  position: string;
  condition?: string;
}

interface FormationFieldProps {
  formation: Formation | null;
  goalkeeper?: FormationPlayer | null;
  linePlayers?: FormationPlayer[];
  className?: string;
}

const FORMATION_POSITIONS: Record<
  Formation,
  { row: string; top: number; count: number; label: string }[]
> = {
  "3-1": [
    { row: "defense", top: 65, count: 3, label: "Defesa" },
    { row: "attack", top: 25, count: 1, label: "Ataque" },
  ],
  "2-2": [
    { row: "defense", top: 65, count: 2, label: "Defesa" },
    { row: "attack", top: 25, count: 2, label: "Ataque" },
  ],
  "2-1-1": [
    { row: "defense", top: 70, count: 2, label: "Defesa" },
    { row: "midfield", top: 45, count: 1, label: "Meio" },
    { row: "attack", top: 20, count: 1, label: "Ataque" },
  ],
  "1-2-1": [
    { row: "defense", top: 70, count: 1, label: "Defesa" },
    { row: "midfield", top: 45, count: 2, label: "Meio" },
    { row: "attack", top: 20, count: 1, label: "Ataque" },
  ],
};

function getConditionColor(condition?: string): string {
  switch (condition) {
    case "DOENTE":
      return "bg-destructive";
    case "MAL_CONDICIONADO":
      return "bg-warning";
    default:
      return "bg-primary";
  }
}

export function FormationField({
  formation,
  goalkeeper,
  linePlayers = [],
  className,
}: FormationFieldProps) {
  if (!formation) {
    return (
      <div
        className={cn(
          "flex h-64 items-center justify-center rounded-lg border-2 border-dashed bg-muted/30",
          className,
        )}
      >
        <p className="text-sm text-muted-foreground">
          Selecione uma formação
        </p>
      </div>
    );
  }

  const positions = FORMATION_POSITIONS[formation];

  return (
    <div
      className={cn(
        "relative h-64 overflow-hidden rounded-lg border bg-green-900",
        className,
      )}
    >
      {/* Field lines */}
      <div className="absolute inset-0 border-2 border-white/30" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-white/30" />
      <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/30" />

      {/* Goalkeeper */}
      {goalkeeper && (
        <div
          className="absolute left-1/2 -translate-x-1/2"
          style={{ top: "88%" }}
        >
          <PlayerDot
            name={goalkeeper.name}
            position={goalkeeper.position}
            condition={goalkeeper.condition}
            isGoalkeeper
          />
        </div>
      )}

      {/* Line players by formation */}
      {positions.map((row) => {
        const rowPlayers = linePlayers.filter((p) => {
          const playerIdx = linePlayers.indexOf(p);
          // Map players to rows based on formation
          let offset = 0;
          for (const r of positions) {
            if (r.row === row.row) break;
            offset += r.count;
          }
          return playerIdx >= offset && playerIdx < offset + row.count;
        });

        return (
          <div
            key={row.row}
            className="absolute left-0 right-0 flex justify-center"
            style={{ top: `${row.top}%` }}
          >
            {Array.from({ length: row.count }, (_, i) => {
              const player = rowPlayers[i];
              const xPositions = [50]; // default center
              if (row.count === 2) {
                xPositions[0] = 30;
                xPositions[1] = 70;
              } else if (row.count === 3) {
                xPositions[0] = 20;
                xPositions[1] = 50;
                xPositions[2] = 80;
              }
              return (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${xPositions[i] ?? 50}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  {player ? (
                    <PlayerDot
                      name={player.name}
                      position={player.position}
                      condition={player.condition}
                    />
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-white/50 bg-white/20 text-[10px] text-white/70">
                      ?
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}

      {/* Formation label */}
      <div className="absolute bottom-1 right-2 rounded bg-black/50 px-2 py-0.5 text-xs font-medium text-white">
        {formation}
      </div>
    </div>
  );
}

function PlayerDot({
  name,
  position,
  condition,
  isGoalkeeper = false,
}: {
  name?: string;
  position: string;
  condition?: string;
  isGoalkeeper?: boolean;
}) {
  const color = isGoalkeeper ? "bg-chart-2" : getConditionColor(condition);
  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white shadow-md",
          color,
        )}
      >
        {initials}
      </div>
      {name && (
        <span className="max-w-16 truncate rounded bg-black/60 px-1 py-0.5 text-[9px] text-white">
          {name.split(" ")[0]}
        </span>
      )}
    </div>
  );
}
