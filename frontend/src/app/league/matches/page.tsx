"use client";

import { useState } from "react";
import { MoreVertical, Plus, Swords } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DataTable,
  type DataTableColumn,
} from "@/components/shared/data-table";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBrasiliaDateTime } from "@/lib/datetime";
import { getApiErrorMessage } from "@/lib/http";
import { useClubs } from "@/features/clubs/hooks";
import { getMatch } from "@/features/matches/api";
import { useMatches } from "@/features/matches/hooks";
import { MatchResult } from "@/features/matches/components/match-result";
import { MatchForm } from "@/features/matches/components/match-form";
import type { Match } from "@/features/matches/types";

export default function MatchesPage() {
  const { data: clubs } = useClubs();
  const [clubId, setClubId] = useState("all");

  const filterClubId = clubId === "all" ? undefined : Number(clubId);
  const { data, isLoading, error, refetch } = useMatches(filterClubId);

  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  async function openMatch(id: number) {
    setIsLoadingDetail(true);
    setSelectedMatch(null);
    try {
      setSelectedMatch(await getMatch(id));
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsLoadingDetail(false);
    }
  }

  const columns: DataTableColumn<Match>[] = [
    {
      header: "Data e hora",
      render: (match) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium">
            {match.played_at.split("T")[0].split("-").reverse().join("/")}
          </span>
          <span className="text-xs text-muted-foreground">
            {match.played_at.split("T")[1]?.split("-")[0]?.slice(0, 5) ?? ""}
          </span>
        </div>
      ),
    },
    {
      header: "Mandante",
      render: (match) => (
        <span className="text-sm font-medium">{match.home.club_name}</span>
      ),
    },
    {
      header: "Placar",
      className: "text-center",
      render: (match) => (
        <span className="text-lg font-bold">
          {match.home.goals} × {match.away.goals}
        </span>
      ),
    },
    {
      header: "Visitante",
      render: (match) => (
        <span className="text-sm font-medium">{match.away.club_name}</span>
      ),
    },
    {
      header: "Formações",
      className: "text-center",
      render: (match) => (
        <span className="text-xs text-muted-foreground">
          {match.home.formation} × {match.away.formation}
        </span>
      ),
    },
    {
      header: "Ações",
      className: "text-right",
      render: (match) => (
        <div className="flex items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openMatch(match.id)}>
                <Swords className="h-4 w-4" />
                Ver duelos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Liga", href: "/league" },
          { label: "Partidas" },
        ]}
      />

      <PageHeader
        title="Histórico de partidas"
        description="Partidas da mais recente para a mais antiga."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova partida
          </Button>
        }
      />

      <div className="w-full max-w-xs space-y-2">
        <Label>Filtrar por clube</Label>
        <Select value={clubId} onValueChange={setClubId}>
          <SelectTrigger>
            <SelectValue placeholder="Todos os clubes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os clubes</SelectItem>
            {(clubs ?? []).map((club) => (
              <SelectItem key={club.id} value={String(club.id)}>
                {club.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        rows={data ?? []}
        getRowKey={(match) => match.id}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
        emptyTitle="Nenhuma partida jogada"
        emptyDescription="Jogue partidas para ver o histórico."
      />

      <Dialog
        open={selectedMatch !== null || isLoadingDetail}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedMatch(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Duelos da partida</DialogTitle>
            <DialogDescription>
              {selectedMatch
                ? `${selectedMatch.home.club_name} ${selectedMatch.home.goals} × ${selectedMatch.away.goals} ${selectedMatch.away.club_name}`
                : "Carregando..."}
            </DialogDescription>
          </DialogHeader>
          {isLoadingDetail || !selectedMatch ? (
            <Skeleton className="h-40 w-full" />
          ) : (
            <MatchResult match={selectedMatch} />
          )}
        </DialogContent>
      </Dialog>

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Nova partida"
        description="Escolha o mandante e o visitante. O placar é calculado pela API."
      >
        {isCreateOpen ? (
          <MatchForm
            onSuccess={() => {
              setIsCreateOpen(false);
              refetch();
            }}
          />
        ) : null}
      </FormDialog>
    </div>
  );
}
