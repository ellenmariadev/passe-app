import { api } from "@/lib/http";
import type { Lineup } from "./types";

export async function getLineup(
  clubId: number,
  signal?: AbortSignal,
): Promise<Lineup> {
  const { data } = await api.get<Lineup>(`/clubs/${clubId}/lineup`, { signal });
  return data;
}

export interface SetLineupPayload {
  formation: string;
  player_ids: number[];
}

export async function setLineup(
  clubId: number,
  payload: SetLineupPayload,
): Promise<Lineup> {
  const { data } = await api.put<Lineup>(`/clubs/${clubId}/lineup`, payload);
  return data;
}
