import type { SquadPlayer } from "@/features/players/types";

export interface Club {
  id: number;
  name: string;
  acronym: string;
  cash: number;
  squad_value: number;
  net_worth: number;
}

export interface ClubDetail extends Club {
  players: SquadPlayer[];
}

export type ClubSort = "name" | "net_worth_asc" | "net_worth_desc";
