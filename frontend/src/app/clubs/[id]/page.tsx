"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { Avatar } from "@/components/shared/avatar";
import { BackButton } from "@/components/shared/back-button";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/format";
import { useClub } from "@/features/clubs/hooks";
import { SquadTable } from "@/features/clubs/components/squad-table";
import { usePlayers } from "@/features/players/hooks";
import { BuyForm } from "@/features/transactions/components/buy-form";
import { SellDialog } from "@/features/transactions/components/sell-dialog";
import { TransactionsTable } from "@/features/transactions/components/transactions-table";
import { LineupForm } from "@/features/lineups/components/lineup-form";
import type { Player } from "@/features/players/types";
import type { SquadPlayer } from "@/features/players/types";

export default function ClubDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);

  const { data: club, isLoading, error, refetch } = useClub(id);
  const [sellPlayer, setSellPlayer] = useState<SquadPlayer | null>(null);
  const [isBuyListOpen, setIsBuyListOpen] = useState(false);
  const [buyPlayer, setBuyPlayer] = useState<Player | null>(null);
  const freePlayerFilters = useMemo(
    () => ({ free: true as const, page: 1, limit: 50 }),
    [],
  );
  const {
    data: freePlayersData,
    isLoading: isLoadingFreePlayers,
    error: freePlayersError,
    refetch: refetchFreePlayers,
  } = usePlayers(freePlayerFilters);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !club) {
    return (
      <ErrorState
        message={error ?? "Clube não encontrado."}
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Mercado", href: "/market" },
        { label: "Clubes", href: "/clubs" },
        { label: club.name },
      ]} />

      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Avatar name={club.name} size="lg" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{club.name}</h1>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="rounded bg-muted px-2 py-0.5 text-xs font-medium">
                Sigla {club.acronym}
              </span>
              <span>{club.players.length} de 12 jogadores</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BackButton href="/clubs" />
          <Button onClick={() => {
            setIsBuyListOpen(true);
            refetchFreePlayers();
          }}>
            Comprar jogadores
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KPICard
          label="Caixa"
          value={formatCurrency(club.cash)}
          unit="moedas"
          description="Só muda por compras e vendas"
        />
        <KPICard
          label="Valor do elenco"
          value={formatCurrency(club.squad_value)}
          unit="moedas"
          description="Soma dos valores de mercado"
        />
        <KPICard
          label="Patrimônio"
          value={formatCurrency(club.net_worth)}
          unit="moedas"
          description="Caixa + valor do elenco"
        />
        <KPICard
          label="Elenco"
          value={`${club.players.length} de 12`}
          description="Limite de 12 jogadores"
        />
      </div>

      <Tabs defaultValue="squad">
        <TabsList>
          <TabsTrigger value="squad">Elenco {club.players.length}</TabsTrigger>
          <TabsTrigger value="lineup">Escalação</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>
        <TabsContent value="squad">
          <SquadTable players={club.players} onSell={setSellPlayer} />
        </TabsContent>
        <TabsContent value="lineup">
          <LineupForm clubId={id} players={club.players} />
        </TabsContent>
        <TabsContent value="history">
          <TransactionsTable clubId={id} />
        </TabsContent>
      </Tabs>

      <SellDialog
        player={sellPlayer}
        open={sellPlayer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSellPlayer(null);
          }
        }}
        onSuccess={() => refetch()}
      />

      <Dialog open={isBuyListOpen} onOpenChange={setIsBuyListOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Comprar jogadores</DialogTitle>
            <DialogDescription>
              Selecione um jogador livre para contratar para {club.name}.
            </DialogDescription>
          </DialogHeader>
          {isLoadingFreePlayers ? (
            <Skeleton className="h-32 w-full" />
          ) : freePlayersError ? (
            <ErrorState
              message={freePlayersError}
              onRetry={refetchFreePlayers}
            />
          ) : freePlayersData?.data.length ? (
            <div className="max-h-80 space-y-2 overflow-y-auto">
              {freePlayersData.data.map((player) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between gap-4 rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{player.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {player.position} · Overall {player.overall} ·{" "}
                      {formatCurrency(player.market_value)}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setBuyPlayer(player);
                      setIsBuyListOpen(false);
                    }}
                  >
                    Comprar
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum jogador livre disponível.
            </p>
          )}
        </DialogContent>
      </Dialog>

      <BuyForm
        player={buyPlayer}
        clubs={[club]}
        open={buyPlayer !== null}
        onOpenChange={(open) => {
          if (!open) {
            setBuyPlayer(null);
          }
        }}
        onSuccess={() => {
          setBuyPlayer(null);
          refetch();
          refetchFreePlayers();
        }}
      />
    </div>
  );
}

function KPICard({ label, value, unit, description }: { label: string; value: string; unit?: string; description?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <p className="text-2xl font-semibold">{value}</p>
          {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
