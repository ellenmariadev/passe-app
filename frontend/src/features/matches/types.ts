export interface MatchSide {
  club_id: number;
  club_name: string;
  formation: string;
  goals: number;
}

export interface DuelParticipant {
  playerId: number;
  name: string;
  position: string;
  condition: string;
  attribute: string;
  value: number;
}

export interface Duel {
  order: number;
  attackingClubId: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export type MatchResult = "MANDANTE" | "VISITANTE" | "EMPATE";

export interface Match {
  id: number;
  played_at: string;
  home: MatchSide;
  away: MatchSide;
  result: MatchResult;
  duels?: Duel[];
}

export interface StandingRow {
  position: number;
  club_id: number;
  club_name: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}
