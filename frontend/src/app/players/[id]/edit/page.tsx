"use client";

import { useParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { BackButton } from "@/components/shared/back-button";
import { ErrorState } from "@/components/shared/error-state";
import { PageHeader } from "@/components/shared/page-header";
import { usePlayer } from "@/features/players/hooks";
import { PlayerEditForm } from "@/features/players/components/player-edit-form";

export default function EditPlayerPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: player, isLoading, error, refetch } = usePlayer(id);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !player) {
    return (
      <ErrorState
        message={error ?? "Jogador não encontrado."}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Editar jogador"
        description="Edite nome, posição, agilidade e idade."
        actions={<BackButton href={`/players/${id}`} />}
      />
      <Card>
        <CardContent className="p-6">
          <PlayerEditForm player={player} />
        </CardContent>
      </Card>
    </div>
  );
}
