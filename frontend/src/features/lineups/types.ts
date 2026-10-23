import type { Player } from "@/features/players/types";

export interface Lineup {
  club_id: number;
  formation: string | null;
  complete: boolean;
  players: Player[];
}
