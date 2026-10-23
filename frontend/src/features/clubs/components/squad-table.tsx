"use client";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { POSITION_LABELS } from "@/lib/domain";
import { formatBrasiliaDateTime } from "@/lib/datetime";
import { formatCurrency } from "@/lib/format";
import type { SquadPlayer } from "../../players/types";

interface SquadTableProps {
  players: SquadPlayer[];
  onSell: (player: SquadPlayer) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function SquadTable({
  players,
  onSell,
  isLoading,
  error,
  onRetry,
}: SquadTableProps) {
  const columns: DataTableColumn<SquadPlayer>[] = [
    {
      header: "Nome",
      render: (player) => <span className="font-medium">{player.name}</span>,
    },
    {
      header: "Posição",
      render: (player) => POSITION_LABELS[player.position],
    },
    {
      header: "Overall",
      className: "text-center",
      render: (player) => player.overall,
    },
    {
      header: "Condição",
      render: (player) => <ConditionBadge condition={player.condition} />,
    },
    {
      header: "Valor de mercado",
      className: "text-right",
      render: (player) => (
        <span className="font-medium">
          {formatCurrency(player.market_value)}
        </span>
      ),
    },
    {
      header: "Fim da fidelidade",
      render: (player) =>
        player.contract
          ? formatBrasiliaDateTime(player.contract.loyalty_until)
          : "—",
    },
    {
      header: "Dias restantes",
      className: "text-center",
      render: (player) => player.contract?.remaining_days ?? "—",
    },
    {
      header: "% multa",
      className: "text-center",
      render: (player) =>
        player.contract ? `${player.contract.penalty_rate}%` : "—",
    },
    {
      header: "Ações",
      className: "text-right",
      render: (player) => (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={() => onSell(player)}>
            Vender
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={players}
      getRowKey={(player) => player.id}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="Elenco vazio"
      emptyDescription="Este clube ainda não comprou jogadores."
    />
  );
}
