"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { POSITION_LABELS } from "@/lib/domain";
import { formatCurrency } from "@/lib/format";
import { useClubs } from "@/features/clubs/hooks";
import { usePlayers } from "@/features/players/hooks";
import { BuyForm } from "@/features/transactions/components/buy-form";
import type { Player } from "@/features/players/types";

export default function MarketPage() {
  const [page, setPage] = useState(1);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [buyOpen, setBuyOpen] = useState(false);

  const { data: clubs } = useClubs();

  const freeFilters = useMemo(
    () => ({ free: true as const, page, limit: 10 }),
    [page],
  );

  const { data, isLoading, error, refetch } = usePlayers(freeFilters);

  function openBuy(player: Player) {
    setSelectedPlayer(player);
    setBuyOpen(true);
  }

  const columns: DataTableColumn<Player>[] = [
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
      header: "Idade",
      className: "text-center",
      render: (player) => player.age,
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
      header: "Ações",
      className: "text-right",
      render: (player) => (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => openBuy(player)}>
            <ShoppingCart className="h-4 w-4" />
            Comprar
          </Button>
        </div>
      ),
    },
  ];

  const meta = data?.meta;
  const totalItems = meta?.total_items ?? 0;
  const totalPages = meta?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mercado"
        description="Compre jogadores livres para um clube, com contrato de fidelidade."
      />

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(player) => player.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Nenhum jogador livre"
        emptyDescription="Cadastre jogadores para comprá-los."
        emptyAction={
          <Button asChild>
            <Link href="/players">Ir para jogadores</Link>
          </Button>
        }
      />

      {meta && !isLoading && !error ? (
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>{totalItems} jogador(es) livre(s)</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span>
              Página {page} de {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      <BuyForm
        player={selectedPlayer}
        clubs={clubs ?? []}
        open={buyOpen}
        onOpenChange={setBuyOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
