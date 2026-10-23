import { api } from "@/lib/http";
import { getApiErrorMessage } from "@/lib/http";
import { readBlobMessage } from "@/lib/download";
import type {
  BuyResult,
  SellResult,
  TransactionsFilters,
  TransactionsResponse,
} from "./types";

function toQueryParams(
  filters: TransactionsFilters,
): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (filters.type) params.type = filters.type;
  if (filters.player_id !== undefined) params.player_id = filters.player_id;
  return params;
}

export async function listTransactions(
  clubId: number,
  filters: TransactionsFilters,
  signal?: AbortSignal,
): Promise<TransactionsResponse> {
  const { data } = await api.get<TransactionsResponse>(
    `/clubs/${clubId}/transactions`,
    { params: toQueryParams(filters), signal },
  );
  return data;
}

export async function exportTransactionsCsv(
  clubId: number,
  filters: TransactionsFilters,
): Promise<Blob> {
  try {
    const { data } = await api.get<Blob>(
      `/clubs/${clubId}/transactions/export`,
      {
        params: toQueryParams(filters),
        responseType: "blob",
      },
    );
    return data;
  } catch (error) {
    const blob = (error as { response?: { data?: Blob } }).response?.data;
    const message = blob ? await readBlobMessage(blob) : null;
    throw new Error(message ?? getApiErrorMessage(error));
  }
}

export interface BuyPayload {
  club_id: number;
  loyalty_until: string;
}

export async function buyPlayer(
  playerId: number,
  payload: BuyPayload,
): Promise<BuyResult> {
  const { data } = await api.post<BuyResult>(
    `/players/${playerId}/buy`,
    payload,
  );
  return data;
}

export async function sellPlayer(playerId: number): Promise<SellResult> {
  const { data } = await api.post<SellResult>(`/players/${playerId}/sell`);
  return data;
}
