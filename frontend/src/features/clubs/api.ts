import { api } from "@/lib/http";
import type { Club, ClubDetail, ClubSort } from "./types";

export async function listClubs(
  sort?: ClubSort,
  signal?: AbortSignal,
): Promise<Club[]> {
  const { data } = await api.get<Club[]>("/clubs", {
    params: sort ? { sort } : undefined,
    signal,
  });
  return data;
}

export async function getClub(
  id: number,
  signal?: AbortSignal,
): Promise<ClubDetail> {
  const { data } = await api.get<ClubDetail>(`/clubs/${id}`, { signal });
  return data;
}

export interface CreateClubPayload {
  name: string;
  acronym: string;
}

export async function createClub(payload: CreateClubPayload): Promise<Club> {
  const { data } = await api.post<Club>("/clubs", payload);
  return data;
}
