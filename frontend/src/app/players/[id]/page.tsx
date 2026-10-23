"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/shared/back-button";
import { ErrorState } from "@/components/shared/error-state";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { PageHeader } from "@/components/shared/page-header";
import { POSITION_LABELS } from "@/lib/domain";
import { formatCurrency } from "@/lib/format";
import { useClubs } from "@/features/clubs/hooks";
import { usePlayer } from "@/features/players/hooks";
import { ConditionDialog } from "@/features/players/components/condition-dialog";
import type { Player } from "@/features/players/types";

export default function PlayerDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const router = useRouter();

  const { data: player, isLoading, error, refetch } = usePlayer(id);
  const { data: clubs } = useClubs();
  const [conditionOpen, setConditionOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !player) {
    return <ErrorState message={error ?? "Jogador não encontrado."} />;
  }

  const clubName =
    player.club_id === null
      ? "Livre"
      : (clubs?.find((club) => club.id === player.club_id)?.name ??
        "Com clube");

  return (
    <div className="space-y-6">
      <PageHeader
        title={player.name}
        description={`${POSITION_LABELS[player.position]} · ${clubName}`}
        actions={
          <div className="flex items-center gap-2">
            <BackButton href="/players" />
            <Button
              variant="outline"
              onClick={() => router.push(`/players/${player.id}/edit`)}
            >
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
            <Button onClick={() => setConditionOpen(true)}>
              Alterar condição
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Resumo</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Stat label="Condição">
              <ConditionBadge condition={player.condition} />
            </Stat>
            <Stat label="Idade">{player.age}</Stat>
            <Stat label="Agilidade">{player.agility}</Stat>
            <Stat label="Overall">{player.overall}</Stat>
            <Stat label="Potencial">{player.potential}</Stat>
            <Stat label="Valor base">{formatCurrency(player.base_value)}</Stat>
            <Stat label="Valor de mercado">
              {formatCurrency(player.market_value)}
            </Stat>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Indicadores técnicos</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Stat label="Velocidade">{player.pace}</Stat>
            <Stat label="Finalização">{player.shooting}</Stat>
            <Stat label="Passe">{player.passing}</Stat>
            <Stat label="Drible">{player.dribbling}</Stat>
            <Stat label="Defesa">{player.defending}</Stat>
            <Stat label="Físico">{player.physical}</Stat>
          </CardContent>
        </Card>
      </div>

      <ConditionDialog
        player={player}
        open={conditionOpen}
        onOpenChange={setConditionOpen}
        onSuccess={(updated: Player) => refetch()}
      />
    </div>
  );
}

function Stat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
