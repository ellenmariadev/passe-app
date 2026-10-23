"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Breadcrumb } from "@/components/shared/breadcrumb";
import { PageHeader } from "@/components/shared/page-header";
import { FormDialog } from "@/components/shared/form-dialog";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  CONDITION_OPTIONS,
  POSITION_OPTIONS,
  type Condition,
  type Position,
} from "@/lib/domain";
import { getApiErrorMessage } from "@/lib/http";
import { useClubs } from "@/features/clubs/hooks";
import { deletePlayer } from "@/features/players/api";
import { usePlayers } from "@/features/players/hooks";
import { ConditionDialog } from "@/features/players/components/condition-dialog";
import { PlayersTable } from "@/features/players/components/players-table";
import { PlayerForm } from "@/features/players/components/player-form";
import type {
  Player,
  PlayerFilters,
  PlayerSort,
} from "@/features/players/types";

const SORT_OPTIONS = [
  { value: "name", label: "Nome" },
  { value: "value_asc", label: "Valor de mercado (menor)" },
  { value: "value_desc", label: "Valor de mercado (maior)" },
  { value: "age_asc", label: "Idade (menor)" },
  { value: "age_desc", label: "Idade (maior)" },
  { value: "position", label: "Posição" },
];

export default function PlayersPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("all");
  const [condition, setCondition] = useState("all");
  const [free, setFree] = useState("all");
  const [clubId, setClubId] = useState("all");
  const [minAge, setMinAge] = useState("");
  const [maxAge, setMaxAge] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [sort, setSort] = useState<PlayerSort>("name");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [page, setPage] = useState(1);

  const [conditionPlayer, setConditionPlayer] = useState<Player | null>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const [deletePlayerState, setDeletePlayerState] = useState<Player | null>(
    null,
  );
  const [isDeleting, setIsDeleting] = useState(false);

  const { data: clubs } = useClubs();

  const filters = useMemo<PlayerFilters>(
    () => ({
      search: search.trim().length >= 2 ? search.trim() : undefined,
      position: position === "all" ? undefined : (position as Position),
      condition: condition === "all" ? undefined : (condition as Condition),
      free: free === "all" ? undefined : free === "true",
      club_id: clubId === "all" ? undefined : Number(clubId),
      min_age: minAge === "" ? undefined : Number(minAge),
      max_age: maxAge === "" ? undefined : Number(maxAge),
      min_value: minValue === "" ? undefined : Number(minValue),
      max_value: maxValue === "" ? undefined : Number(maxValue),
      sort,
      page,
      limit: 10,
    }),
    [
      search,
      position,
      condition,
      free,
      clubId,
      minAge,
      maxAge,
      minValue,
      maxValue,
      sort,
      page,
    ],
  );

  useEffect(() => {
    setPage(1);
  }, [
    search,
    position,
    condition,
    free,
    clubId,
    minAge,
    maxAge,
    minValue,
    maxValue,
    sort,
  ]);

  const { data, isLoading, error, refetch } = usePlayers(filters);

  const clubMap = useMemo(
    () => new Map((clubs ?? []).map((club) => [club.id, club.name])),
    [clubs],
  );

  const clubOptions = useMemo(
    () =>
      (clubs ?? []).map((club) => ({
        value: String(club.id),
        label: club.name,
      })),
    [clubs],
  );

  function getClubName(id: number): string | null {
    return clubMap.get(id) ?? null;
  }

  function openCondition(player: Player) {
    setConditionPlayer(player);
    setConditionOpen(true);
  }

  async function handleDelete() {
    if (!deletePlayerState) {
      return;
    }
    setIsDeleting(true);
    try {
      await deletePlayer(deletePlayerState.id);
      toast.success("Jogador excluído.");
      setDeletePlayerState(null);
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  }

  const meta = data?.meta;
  const totalItems = meta?.total_items ?? 0;
  const totalPages = meta?.total_pages ?? 0;

  return (
    <div className="space-y-6">
      <Breadcrumb items={[
        { label: "Mercado", href: "/market" },
        { label: "Jogadores" },
      ]} />

      <PageHeader
        title="Jogadores"
        description="Cadastre jogadores, acompanhe os indicadores e compre os que estão livres."
        actions={
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Novo jogador
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Buscar por nome"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full"
          />
        </div>

        <Select value={position} onValueChange={setPosition}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Posição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {POSITION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Condição" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {CONDITION_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={clubId}
          onValueChange={setClubId}
          disabled={free === "true"}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Clube" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {clubOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={free} onValueChange={(value) => {
          setFree(value);
          if (value === "true") {
            setClubId("all");
          }
        }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Situação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="true">Só livres</SelectItem>
            <SelectItem value="false">Com clube</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <PlayersTable
        players={data?.data ?? []}
        getClubName={getClubName}
        onView={(player) => router.push(`/players/${player.id}`)}
        onEdit={(player) => router.push(`/players/${player.id}/edit`)}
        onCondition={openCondition}
        onDelete={setDeletePlayerState}
        onViewClub={(clubId) => router.push(`/clubs/${clubId}`)}
        isLoading={isLoading}
        error={error}
        onRetry={refetch}
      />

      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">
            Todos <span className="text-muted-foreground">{totalItems}</span>
          </span>
        </div>

        <Select value={sort} onValueChange={(value) => setSort(value as PlayerSort)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {meta && !isLoading && !error ? (
        <div className="flex flex-col items-center justify-between gap-2 text-sm text-muted-foreground sm:flex-row">
          <span>Mostrando {(page - 1) * 10 + 1}–{Math.min(page * 10, totalItems)} de {totalItems} jogadores</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
              >
                {p}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      ) : null}

      <ConditionDialog
        player={conditionPlayer}
        open={conditionOpen}
        onOpenChange={setConditionOpen}
        onSuccess={() => refetch()}
      />

      <ConfirmDialog
        open={deletePlayerState !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeletePlayerState(null);
          }
        }}
        title="Excluir jogador"
        description={`Tem certeza de que deseja excluir ${deletePlayerState?.name}?`}
        confirmLabel="Excluir"
        destructive
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />

      <FormDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        title="Cadastrar jogador"
        description="Informe os indicadores técnicos. O valor base e o overall são calculados pela API após salvar."
      >
        {isCreateOpen ? (
          <PlayerForm
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
