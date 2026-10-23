"use client";

import { Card, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { PlayerForm } from "@/features/players/components/player-form";
import type { Player } from "@/features/players/types";

export default function NewPlayerPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Cadastrar jogador"
        description="Informe os indicadores técnicos. O valor base e o overall são calculados pela API após salvar."
        backHref="/players"
      />
      <Card>
        <CardContent className="p-6">
          <PlayerForm
            onSuccess={(player: Player) => {
              window.location.href = `/players/${player.id}`;
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
