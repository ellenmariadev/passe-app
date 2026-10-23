import { api } from "@/lib/http";
import type { Match, StandingRow } from "./types";

export async function listMatches(
  clubId?: number,
  signal?: AbortSignal,
): Promise<Match[]> {
  const { data } = await api.get<Match[]>("/matches", {
    params: clubId !== undefined ? { club_id: clubId } : undefined,
    signal,
  });
  return data;
}

export async function getMatch(
  id: number,
  signal?: AbortSignal,
): Promise<Match> {
  const { data } = await api.get<Match>(`/matches/${id}`, { signal });
  return data;
}

export interface CreateMatchPayload {
  home_club_id: number;
  away_club_id: number;
}

export async function createMatch(payload: CreateMatchPayload): Promise<Match> {
  const { data } = await api.post<Match>("/matches", payload);
  return data;
}

export async function listStandings(
  signal?: AbortSignal,
): Promise<StandingRow[]> {
  const { data } = await api.get<StandingRow[]>("/standings", { signal });
  return data;
}
