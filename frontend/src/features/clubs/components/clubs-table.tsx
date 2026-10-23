"use client";

import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/shared/avatar";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/format";
import type { Club } from "../types";

interface ClubsTableProps {
  clubs: Club[];
  onView: (club: Club) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function ClubsTable({
  clubs,
  onView,
  isLoading,
  error,
  onRetry,
}: ClubsTableProps) {
  const columns: DataTableColumn<Club>[] = [
    {
      header: "Clube",
      render: (club) => (
        <div className="flex items-center gap-3">
          <Avatar name={club.name} size="sm" />
          <span className="font-medium">{club.name}</span>
        </div>
      ),
    },
    {
      header: "Sigla",
      render: (club) => (
        <span className="rounded bg-muted px-1.5 py-0.5 text-xs font-medium">
          {club.acronym}
        </span>
      ),
    },
    {
      header: "Caixa",
      className: "text-right",
      render: (club) => formatCurrency(club.cash),
    },
    {
      header: "Valor do elenco",
      className: "text-right",
      render: (club) => formatCurrency(club.squad_value),
    },
    {
      header: "Patrimônio",
      className: "text-right",
      render: (club) => (
        <span className="font-semibold">{formatCurrency(club.net_worth)}</span>
      ),
    },
    {
      header: "",
      className: "text-right",
      render: (club) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(club)}
          className="gap-1"
        >
          Ver clube
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={clubs}
      getRowKey={(club) => club.id}
      onRowClick={onView}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="Nenhum clube cadastrado"
      emptyDescription="Crie clubes para começar a montar os elencos."
    />
  );
}
