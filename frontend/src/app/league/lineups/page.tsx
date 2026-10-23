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
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { useClub, useClubs } from "@/features/clubs/hooks";
import { LineupForm } from "@/features/lineups/components/lineup-form";

export default function LeagueLineupsPage() {
  const { data: clubs } = useClubs();
  const [clubId, setClubId] = useState("");

  const { data: club, isLoading: isLoadingClub } = useClub(
    clubId ? Number(clubId) : 0,
  );

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: "Liga" }, { label: "Escalação" }]} />
      <PageHeader
        title="Escalação"
        description="Escolha a formação e os 5 titulares de cada clube."
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
        club && !isLoadingClub ? (
          <LineupForm clubId={Number(clubId)} players={club.players} />
        ) : (
          <EmptyState
            title="Carregando..."
            description="Buscando informações do clube."
          />
        )
      ) : (
        <EmptyState
          title="Selecione um clube"
          description="Escolha um clube para definir a escalação."
        />
      )}
    </div>
  );
}
