"use client";

import { Medal, TrendingDown, TrendingUp } from "lucide-react";

import { Avatar } from "@/components/shared/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { cn } from "@/lib/utils";
import type { StandingRow } from "../types";

interface StandingsTableProps {
  rows: StandingRow[];
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function StandingsTable({
  rows,
  isLoading,
  error,
  onRetry,
}: StandingsTableProps) {
  const columns: DataTableColumn<StandingRow>[] = [
    {
      header: "Pos",
      className: "text-center",
      render: (row) => {
        if (row.position === 1) {
          return (
            <div className="flex items-center justify-center">
              <Badge variant="default" className="gap-1 px-2 py-0.5">
                <Medal className="h-3 w-3" />
                {row.position}
              </Badge>
            </div>
          );
        }
        if (row.position <= 3) {
          return (
            <span className="inline-flex items-center justify-center rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {row.position}
            </span>
          );
        }
        return (
          <span className="text-sm text-muted-foreground">
            {row.position}
          </span>
        );
      },
    },
    {
      header: "Clube",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.club_name} size="sm" />
          <span className="font-medium">{row.club_name}</span>
        </div>
      ),
    },
    {
      header: "J",
      className: "text-center",
      render: (row) => <span className="text-sm">{row.played}</span>,
    },
    {
      header: "V",
      className: "text-center",
      render: (row) => (
        <span className="text-sm font-medium text-success-soft-foreground">
          {row.wins}
        </span>
      ),
    },
    {
      header: "E",
      className: "text-center",
      render: (row) => <span className="text-sm">{row.draws}</span>,
    },
    {
      header: "D",
      className: "text-center",
      render: (row) => (
        <span className="text-sm font-medium text-destructive">
          {row.losses}
        </span>
      ),
    },
    {
      header: "GP",
      className: "text-center",
      render: (row) => <span className="text-sm">{row.goals_for}</span>,
    },
    {
      header: "GC",
      className: "text-center",
      render: (row) => <span className="text-sm">{row.goals_against}</span>,
    },
    {
      header: "SG",
      className: "text-center",
      render: (row) => {
        if (row.goal_difference > 0) {
          return (
            <span className="flex items-center justify-center gap-1 text-sm font-medium text-success">
              <TrendingUp className="h-3 w-3" />
              +{row.goal_difference}
            </span>
          );
        }
        if (row.goal_difference < 0) {
          return (
            <span className="flex items-center justify-center gap-1 text-sm font-medium text-destructive">
              <TrendingDown className="h-3 w-3" />
              {row.goal_difference}
            </span>
          );
        }
        return <span className="text-sm text-muted-foreground">0</span>;
      },
    },
    {
      header: "Pts",
      className: "text-center",
      render: (row) => (
        <span className="text-base font-bold">{row.points}</span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowKey={(row) => row.club_id}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyTitle="Nenhum clube na classificação"
      emptyDescription="Crie clubes e jogue partidas para formar a classificação."
    />
  );
}
