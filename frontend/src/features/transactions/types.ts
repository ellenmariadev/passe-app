export type TransactionType = "COMPRA" | "VENDA";

export interface Transaction {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: TransactionType;
  value: number;
  fee: number;
  penalty: number;
  profit: number | null;
  cash_change: number;
  created_at: string;
}

export interface TransactionsSummary {
  total_spent: number;
  total_received: number;
  total_fees: number;
  total_penalties: number;
  total_profit: number;
}

export interface TransactionsResponse {
  data: Transaction[];
  summary: TransactionsSummary;
}

export interface TransactionsFilters {
  type?: string;
  player_id?: number;
}

export interface BuyResult {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: "COMPRA";
  value: number;
  fee: number;
  penalty: number;
  profit: null;
  cash_change: number;
  created_at: string;
  contract: {
    purchase_value: number;
    loyalty_until: string;
    status: string;
  };
  club_cash: number;
}

export interface SellResult {
  id: number;
  club_id: number;
  player_id: number;
  player_name: string;
  type: "VENDA";
  value: number;
  fee: number;
  penalty: number;
  profit: number;
  cash_change: number;
  created_at: string;
  purchase_value: number;
  remaining_days: number;
  penalty_rate: number;
  contract_status: string;
  club_cash: number;
}
