"use client";

import { useState } from "react";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useClubs } from "@/features/clubs/hooks";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";

export default function MarketTransactionsPage() {
  const { data: clubs } = useClubs();
  const [clubId, setClubId] = useState("");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Histórico de transações"
        description="Consulte compras e vendas de cada clube, com totais e exportação CSV."
      />

      <div className="w-full max-w-xs space-y-2">
        <Label>Clube</Label>
        <Select value={clubId} onValueChange={setClubId}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione o clube" />
          </SelectTrigger>
          <SelectContent>
            {(clubs ?? []).map((club) => (
              <SelectItem key={club.id} value={String(club.id)}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {clubId ? (
        <TransactionsTable clubId={Number(clubId)} />
      ) : (
        <EmptyState
          title="Selecione um clube"
          description="Escolha um clube para visualizar o histórico de transações."
        />
      )}
    </div>
  );
}
