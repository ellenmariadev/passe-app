"use client";

import { useMemo, useState } from "react";
import { Download, ShoppingCart, Tag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { downloadBlob } from "@/lib/download";
import { formatBrasiliaDateTime } from "@/lib/datetime";
import { formatCurrency, formatSignedCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/http";
import { exportTransactionsCsv } from "../api";
import { useTransactions } from "../hooks";
import type { Transaction, TransactionsFilters } from "../types";

const TYPE_OPTIONS = [
  { value: "COMPRA", label: "Compra" },
  { value: "VENDA", label: "Venda" },
] as const;

interface TransactionsTableProps {
  clubId: number;
}

export function TransactionsTable({ clubId }: TransactionsTableProps) {
  const [types, setTypes] = useState<string[]>(["COMPRA", "VENDA"]);
  const [playerId, setPlayerId] = useState<string>("all");

  const filters: TransactionsFilters = useMemo(() => {
    const filtered = {
      type:
        types.length === 1
          ? types[0]
          : types.length === 2
            ? undefined
            : undefined,
      player_id: playerId === "all" ? undefined : Number(playerId),
    };
    return filtered;
  }, [types, playerId]);

  const fullHistory = useTransactions(clubId, {});
  const { data, isLoading, error, refetch } = useTransactions(clubId, filters);

  const playerOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const transaction of fullHistory.data?.data ?? []) {
      if (!map.has(transaction.player_id)) {
        map.set(transaction.player_id, transaction.player_name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({
      value: String(id),
      label: name,
    }));
  }, [fullHistory.data]);

  function toggleType(value: string) {
    setTypes((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleExport() {
    try {
      const blob = await exportTransactionsCsv(clubId, filters);
      downloadBlob(blob, `transacoes-clube-${clubId}.csv`);
      toast.success("Histórico exportado em CSV.");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  const columns: DataTableColumn<Transaction>[] = [
    {
      header: "Data e hora",
      render: (transaction) => (
        <div className="flex flex-col">
          <span className="font-medium">{transaction.created_at.split("T")[0].split("-").reverse().join("/")}</span>
          <span className="text-xs text-muted-foreground">
            {transaction.created_at.split("T")[1]?.split("-")[0]?.slice(0, 5) ?? ""}
          </span>
        </div>
      ),
    },
    {
      header: "Tipo",
      render: (transaction) => (
        <Badge
          variant={transaction.type === "COMPRA" ? "default" : "secondary"}
          className="gap-1.5"
        >
          {transaction.type === "COMPRA" ? (
            <ShoppingCart className="h-3 w-3" />
          ) : (
            <Tag className="h-3 w-3" />
          )}
          {transaction.type === "COMPRA" ? "Compra" : "Venda"}
        </Badge>
      ),
    },
    {
      header: "Jogador",
      render: (transaction) => (
        <div className="flex items-center gap-3">
          <Avatar name={transaction.player_name} size="sm" />
          <span className="font-medium">{transaction.player_name}</span>
        </div>
      ),
    },
    {
      header: "Valor",
      className: "text-right",
      render: (transaction) => formatCurrency(transaction.value),
    },
    {
      header: "Taxa ou comissão",
      className: "text-right",
      render: (transaction) => formatCurrency(transaction.fee),
    },
    {
      header: "Multa",
      className: "text-right",
      render: (transaction) => formatCurrency(transaction.penalty),
    },
    {
      header: "Lucro",
      className: "text-right",
      render: (transaction) =>
        transaction.profit === null ? (
          <span className="text-muted-foreground">–</span>
        ) : (
          <span
            className={
              transaction.profit >= 0
                ? "text-success"
                : "text-destructive"
            }
          >
            {formatCurrency(transaction.profit)}
          </span>
        ),
    },
    {
      header: "Variação do caixa",
      className: "text-right",
      render: (transaction) => (
        <span
          className={
            transaction.cash_change >= 0
              ? "font-semibold text-success"
              : "font-semibold text-destructive"
          }
        >
          {formatSignedCurrency(transaction.cash_change)}
        </span>
      ),
    },
  ];

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Histórico de transações</h3>
          <p className="text-sm text-muted-foreground">
            Da mais recente para a mais antiga, com o nome e os valores do momento de cada operação.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="h-4 w-4" />
          Exportar CSV
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Tipo</span>
          <div className="flex items-center gap-2">
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleType(option.value)}
                className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium transition-colors ${
                  types.includes(option.value)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input bg-background text-muted-foreground hover:bg-accent"
                }`}
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded ${
                    types.includes(option.value)
                      ? "bg-primary"
                      : "border border-input"
                  }`}
                >
                  {types.includes(option.value) && (
                    <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full sm:w-56">
          <Select value={playerId} onValueChange={setPlayerId}>
            <SelectTrigger>
              <SelectValue placeholder="Jogador: todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Jogador: todos</SelectItem>
              {playerOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        rows={data?.data ?? []}
        getRowKey={(transaction) => transaction.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Nenhuma transação encontrada"
        emptyDescription="Compras e vendas do clube aparecerão aqui."
      />

      {summary && data && data.data.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 sm:grid-cols-5">
          <SummaryItem
            label="Total pago em compras"
            value={summary.total_spent}
            icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryItem
            label="Total recebido em vendas"
            value={summary.total_received}
            icon={<Tag className="h-4 w-4 text-muted-foreground" />}
          />
          <SummaryItem
            label="Taxas e comissões"
            value={summary.total_fees}
            icon={<span className="text-muted-foreground"></span>}
          />
          <SummaryItem
            label="Multas"
            value={summary.total_penalties}
            icon={<span className="text-muted-foreground">⚠</span>}
          />
          <SummaryItem
            label="Lucro total"
            value={summary.total_profit}
            signed
            icon={<span className="text-muted-foreground">↗</span>}
          />
        </div>
      ) : null}

      {summary && data && data.data.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Os totais respeitam os filtros selecionados.
        </p>
      )}
    </div>
  );
}

function SummaryItem({
  label,
  value,
  signed = false,
  icon,
}: {
  label: string;
  value: number;
  signed?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-semibold">
        {signed ? formatSignedCurrency(value) : formatCurrency(value)}
      </p>
    </div>
  );
}
