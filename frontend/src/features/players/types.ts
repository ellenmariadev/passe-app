import type { Condition, Position } from "@/lib/domain";

export interface Player {
  id: number;
  name: string;
  position: Position;
  agility: number;
  age: number;
  condition: Condition;
  base_value: number;
  market_value: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
  overall: number;
  club_id: number | null;
}

export interface PlayerContract {
  purchase_value: number;
  loyalty_until: string;
  remaining_days: number;
  penalty_rate: number;
}

export interface SquadPlayer extends Player {
  contract: PlayerContract | null;
}

export interface PlayersMeta {
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

export interface PlayersResponse {
  data: Player[];
  meta: PlayersMeta;
}

export type PlayerSort =
  | "name"
  | "value_asc"
  | "value_desc"
  | "age_asc"
  | "age_desc"
  | "position";

export interface PlayerFilters {
  search?: string;
  position?: Position;
  condition?: Condition;
  free?: boolean;
  club_id?: number;
  min_age?: number;
  max_age?: number;
  min_value?: number;
  max_value?: number;
  sort?: PlayerSort;
  page?: number;
  limit?: number;
}

export interface CreatePlayerPayload {
  name: string;
  position: Position;
  agility: number;
  age: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  potential: number;
}

export interface UpdatePlayerPayload {
  name: string;
  position: Position;
  agility: number;
  age: number;
}
