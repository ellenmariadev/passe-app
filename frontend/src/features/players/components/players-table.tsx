"use client";

import { Activity, Eye, MoreVertical, Pencil, ShoppingCart, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/shared/avatar";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { POSITION_LABELS } from "@/lib/domain";
import { formatCurrency } from "@/lib/format";
import type { Player } from "../types";

interface PlayersTableProps {
  players: Player[];
  getClubName: (clubId: number) => string | null;
  onView: (player: Player) => void;
  onEdit: (player: Player) => void;
  onCondition: (player: Player) => void;
  onDelete: (player: Player) => void;
  onBuy?: (player: Player) => void;
  onViewClub?: (clubId: number) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function PlayersTable({
  players,
  getClubName,
  onView,
  onEdit,
  onCondition,
  onDelete,
  onBuy,
  onViewClub,
  isLoading,
  error,
  onRetry,
}: PlayersTableProps) {
  const columns: DataTableColumn<Player>[] = [
    {
      header: "Jogador",
      render: (player) => (
        <div className="flex items-center gap-3">
          <Avatar name={player.name} size="sm" />
          <div>
            <div className="font-medium">{player.name}</div>
            <div className="text-xs text-muted-foreground">
              {POSITION_LABELS[player.position]}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: "Posição",
      render: (player) => (
        <span className="text-xs font-medium">{player.position}</span>
      ),
    },
    {
      header: "Overall",
      className: "text-center",
      render: (player) => (
        <span className="font-semibold">{player.overall}</span>
      ),
    },
    {
      header: "Agilidade",
      className: "text-center",
      render: (player) => (
        <div className="flex items-center justify-center gap-2">
          <span className="font-medium">{player.agility}</span>
          <div className="h-1.5 w-12 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${player.agility}%` }}
            />
          </div>
        </div>
      ),
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
      header: "Valor base",
      className: "text-right",
      render: (player) => formatCurrency(player.base_value),
    },
    {
      header: "Valor de mercado",
      className: "text-right",
      render: (player) => (
        <span className="font-semibold">
          {formatCurrency(player.market_value)}
        </span>
      ),
    },
    {
      header: "Clube",
      render: (player) =>
        player.club_id === null ? (
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Livre</span>
            {onBuy && (
              <Button variant="outline" size="sm" onClick={() => onBuy(player)}>
                <ShoppingCart className="h-3.5 w-3.5" />
                Comprar
              </Button>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
              {getClubName(player.club_id)?.split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase() ?? "CLB"}
            </span>
            <button
              onClick={() => onViewClub?.(player.club_id!)}
              className="text-sm text-primary hover:underline"
            >
              {getClubName(player.club_id) ?? "Com clube"}
            </button>
          </div>
        ),
    },
    {
      header: "Ações",
      className: "text-right",
      render: (player) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label={`Ações para ${player.name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onView(player)}>
                <Eye />
                Ver jogador
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(player)}>
                <Pencil />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onCondition(player)}>
                <Activity />
                Alterar condição
              </DropdownMenuItem>
              {player.club_id === null ? (
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => onDelete(player)}
                >
                  <Trash2 />
                  Excluir
                </DropdownMenuItem>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={players}
      getRowKey={(player) => player.id}
      onRowClick={onView}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="Nenhum jogador encontrado"
      emptyDescription="Cadastre jogadores ou ajuste os filtros da busca."
    />
  );
}
