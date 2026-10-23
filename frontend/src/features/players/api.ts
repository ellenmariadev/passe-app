import { api } from "@/lib/http";
import type { Condition } from "@/lib/domain";
import type {
  CreatePlayerPayload,
  Player,
  PlayerFilters,
  PlayersResponse,
  UpdatePlayerPayload,
} from "./types";

function toQueryParams(
  filters: PlayerFilters,
): Record<string, string | number | boolean> {
  const params: Record<string, string | number | boolean> = {};
  if (filters.search) params.search = filters.search;
  if (filters.position) params.position = filters.position;
  if (filters.condition) params.condition = filters.condition;
  if (filters.free !== undefined) params.free = filters.free;
  if (filters.club_id !== undefined) params.club_id = filters.club_id;
  if (filters.min_age !== undefined) params.min_age = filters.min_age;
  if (filters.max_age !== undefined) params.max_age = filters.max_age;
  if (filters.min_value !== undefined) params.min_value = filters.min_value;
  if (filters.max_value !== undefined) params.max_value = filters.max_value;
  if (filters.sort) params.sort = filters.sort;
  if (filters.page !== undefined) params.page = filters.page;
  if (filters.limit !== undefined) params.limit = filters.limit;
  return params;
}

export async function listPlayers(
  filters: PlayerFilters,
  signal?: AbortSignal,
): Promise<PlayersResponse> {
  const { data } = await api.get<PlayersResponse>("/players", {
    params: toQueryParams(filters),
    signal,
  });
  return data;
}

export async function getPlayer(
  id: number,
  signal?: AbortSignal,
): Promise<Player> {
  const { data } = await api.get<Player>(`/players/${id}`, { signal });
  return data;
}

export async function createPlayer(
  payload: CreatePlayerPayload,
): Promise<Player> {
  const { data } = await api.post<Player>("/players", payload);
  return data;
}

export async function updatePlayer(
  id: number,
  payload: UpdatePlayerPayload,
): Promise<Player> {
  const { data } = await api.put<Player>(`/players/${id}`, payload);
  return data;
}

export async function updatePlayerCondition(
  id: number,
  condition: Condition,
): Promise<Player> {
  const { data } = await api.patch<Player>(`/players/${id}/condition`, {
    condition,
  });
  return data;
}

export async function deletePlayer(id: number): Promise<void> {
  await api.delete(`/players/${id}`);
}
