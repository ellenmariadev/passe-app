"use client";

import { useEffect, useMemo } from "react";
import { AlertTriangle, Check, Users } from "lucide-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/shared/avatar";
import { ConditionBadge } from "@/components/shared/condition-badge";
import { ErrorState } from "@/components/shared/error-state";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FORMATION_OPTIONS,
  POSITION_LABELS,
  type Formation,
  type Position,
} from "@/lib/domain";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/http";
import { setLineup } from "../api";
import { useLineup } from "../hooks";
import { lineupSchema, type LineupFormValues } from "../schemas";
import type { SquadPlayer } from "@/features/players/types";
import { FormationField } from "./formation-field";
import { FormationSelector } from "./formation-selector";

interface LineSlot {
  label: string;
  positions: Position[];
  description: string;
}

const FORMATION_SLOTS: Record<Formation, LineSlot[]> = {
  "3-1": [
    { label: "Defensor 1", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Defensor 2", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Defensor 3", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Atacante", positions: ["ATA"], description: "ATA" },
  ],
  "2-2": [
    { label: "Defensor 1", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Defensor 2", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Atacante 1", positions: ["ATA"], description: "ATA" },
    { label: "Atacante 2", positions: ["ATA"], description: "ATA" },
  ],
  "2-1-1": [
    { label: "Defensor 1", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Defensor 2", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Meia", positions: ["MEI"], description: "MEI" },
    { label: "Atacante", positions: ["ATA"], description: "ATA" },
  ],
  "1-2-1": [
    { label: "Defensor", positions: ["ZAG", "LAT"], description: "ZAG ou LAT" },
    { label: "Meia 1", positions: ["MEI"], description: "MEI" },
    { label: "Meia 2", positions: ["MEI"], description: "MEI" },
    { label: "Atacante", positions: ["ATA"], description: "ATA" },
  ],
};

const SLOT_FIELDS = ["slot1", "slot2", "slot3", "slot4"] as const;

interface LineupFormProps {
  clubId: number;
  players: SquadPlayer[];
}

export function LineupForm({ clubId, players }: LineupFormProps) {
  const { data: lineup, isLoading, error, refetch } = useLineup(clubId);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LineupFormValues>({
    resolver: yupResolver(lineupSchema),
    defaultValues: {
      formation: undefined,
      goalkeeper_id: "",
      slot1: "",
      slot2: "",
      slot3: "",
      slot4: "",
    },
  });

  const formation = useWatch({ control, name: "formation" });
  const values = useWatch({ control });

  useEffect(() => {
    if (!lineup || lineup.players.length === 0) {
      reset({
        formation: undefined,
        goalkeeper_id: "",
        slot1: "",
        slot2: "",
        slot3: "",
        slot4: "",
      });
      return;
    }
    const goalkeeper = lineup.players.find((p) => p.position === "GOL");
    const linePlayers = lineup.players.filter((p) => p.position !== "GOL");
    reset({
      formation: (lineup.formation as Formation | null) ?? undefined,
      goalkeeper_id: goalkeeper ? String(goalkeeper.id) : "",
      slot1: linePlayers[0] ? String(linePlayers[0].id) : "",
      slot2: linePlayers[1] ? String(linePlayers[1].id) : "",
      slot3: linePlayers[2] ? String(linePlayers[2].id) : "",
      slot4: linePlayers[3] ? String(linePlayers[3].id) : "",
    });
  }, [lineup, reset]);

  const eligiblePlayers = useMemo(
    () => players.filter((p) => p.condition !== "DOENTE"),
    [players],
  );

  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players],
  );

  function clearSlots() {
    setValue("slot1", "");
    setValue("slot2", "");
    setValue("slot3", "");
    setValue("slot4", "");
  }

  function optionList(positions: Position[], excludeIds: string[]) {
    return eligiblePlayers
      .filter((p) => positions.includes(p.position))
      .filter((p) => !excludeIds.includes(String(p.id)))
      .map((p) => ({ value: String(p.id), label: p.name }));
  }

  const selectedIds = [
    values.goalkeeper_id,
    values.slot1,
    values.slot2,
    values.slot3,
    values.slot4,
  ].filter((id): id is string => Boolean(id));

  function optionsForSlot(
    field: "goalkeeper_id" | (typeof SLOT_FIELDS)[number],
    positions: Position[],
  ) {
    const own = values[field];
    const others = selectedIds.filter((id) => id !== own);
    return optionList(positions, others);
  }

  function getPlayerLabel(playerId: string | undefined) {
    if (!playerId) return "";
    const p = playerMap.get(Number(playerId));
    return p ? `${p.name} (${POSITION_LABELS[p.position]})` : "";
  }

  const selectedLinePlayers: (SquadPlayer | undefined)[] = [
    playerMap.get(Number(values.slot1)),
    playerMap.get(Number(values.slot2)),
    playerMap.get(Number(values.slot3)),
    playerMap.get(Number(values.slot4)),
  ];

  async function onSubmit(data: LineupFormValues) {
    const player_ids = [
      data.goalkeeper_id,
      data.slot1,
      data.slot2,
      data.slot3,
      data.slot4,
    ].map(Number);
    try {
      await setLineup(clubId, {
        formation: data.formation,
        player_ids,
      });
      toast.success("Escalação salva com sucesso.");
      refetch();
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (players.length === 0) {
    return (
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Este clube ainda não possui jogadores no elenco.
      </div>
    );
  }

  const slots = formation ? FORMATION_SLOTS[formation] : [];
  const isComplete =
    formation &&
    values.goalkeeper_id &&
    values.slot1 &&
    values.slot2 &&
    values.slot3 &&
    values.slot4;

  return (
    <div className="space-y-6">
      {lineup && !lineup.complete && lineup.players.length > 0 ? (
        <div className="flex items-start gap-3 rounded-lg border border-warning-soft-border bg-warning-soft p-4 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning-soft-foreground">
              Escalação incompleta
            </p>
            <p className="mt-1 text-warning-soft-foreground">
              O clube não pode jogar até escalar os 5 titulares. Escalados:{" "}
              {lineup.players.length}/5
            </p>
          </div>
        </div>
      ) : null}

      {isComplete && lineup?.complete && (
        <div className="flex items-start gap-3 rounded-lg border border-success-soft-border bg-success-soft p-4 text-sm">
          <Check className="h-5 w-5 shrink-0 text-success" />
          <div>
            <p className="font-medium text-success-soft-foreground">
              Escalação completa
            </p>
            <p className="mt-1 text-success-soft-foreground">
              5 titulares escalados na formação {lineup.formation}. O clube está
              pronto para jogar.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Users className="h-4 w-4" />
                Escalação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Formação
                  </p>
                  <Controller
                    name="formation"
                    control={control}
                    render={({ field }) => (
                      <FormationSelector
                        value={field.value}
                        onChange={(val) => {
                          field.onChange(val);
                          clearSlots();
                        }}
                      />
                    )}
                  />
                  {errors.formation?.message && (
                    <p className="mt-1 text-xs text-destructive">
                      {errors.formation.message}
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium text-muted-foreground">
                    Titulares
                  </p>
                  <FormField
                    label="Goleiro"
                    htmlFor="goalkeeper_id"
                    required
                    error={errors.goalkeeper_id?.message}
                  >
                    <Select
                      value={values.goalkeeper_id}
                      onValueChange={(v) => setValue("goalkeeper_id", v)}
                    >
                      <SelectTrigger id="goalkeeper_id">
                        <SelectValue placeholder="Escolha o goleiro">
                          {values.goalkeeper_id
                            ? getPlayerLabel(values.goalkeeper_id)
                            : "Escolha o goleiro"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {optionsForSlot("goalkeeper_id", ["GOL"]).map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                        {optionsForSlot("goalkeeper_id", ["GOL"]).length ===
                          0 && (
                          <div className="px-2 py-1.5 text-sm text-muted-foreground">
                            Nenhum goleiro disponível
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </FormField>

                  {slots.map((slot, index) => {
                    const field = SLOT_FIELDS[index];
                    return (
                      <FormField
                        key={field}
                        label={slot.label}
                        htmlFor={field}
                        required
                        error={errors[field]?.message}
                      >
                        <Select
                          value={values[field]}
                          onValueChange={(v) => setValue(field, v)}
                        >
                          <SelectTrigger id={field}>
                            <SelectValue placeholder="Escolha um jogador">
                              {values[field]
                                ? getPlayerLabel(values[field])
                                : "Escolha um jogador"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {optionList(slot.positions, selectedIds.filter(id => id !== values[field])).map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                            {optionList(slot.positions, selectedIds.filter(id => id !== values[field])).length === 0 && (
                              <div className="px-2 py-1.5 text-sm text-muted-foreground">
                                Nenhum jogador disponível para{" "}
                                {slot.description}
                              </div>
                            )}
                          </SelectContent>
                        </Select>
                      </FormField>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Salvando..." : "Salvar escalação"}
                  </Button>
                  {lineup?.complete && (
                    <span className="text-xs text-muted-foreground">
                      Escalação atual
                    </span>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right: Field Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Em campo</CardTitle>
              <p className="text-xs text-muted-foreground">
                {formation
                  ? `Prévia da formação ${formation}`
                  : "Selecione uma formação"}
              </p>
            </CardHeader>
            <CardContent>
              <FormationField
                formation={formation ?? null}
                goalkeeper={
                  values.goalkeeper_id
                    ? playerMap.get(Number(values.goalkeeper_id))
                    : undefined
                }
                linePlayers={selectedLinePlayers.filter(
                  (p): p is SquadPlayer => p !== undefined,
                )}
              />
            </CardContent>
          </Card>

          {formation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Reservas</CardTitle>
                <p className="text-xs text-muted-foreground">
                  Jogadores do elenco fora da escalação
                </p>
              </CardHeader>
              <CardContent>
                {(() => {
                  const selected = new Set(selectedIds.map(Number));
                  const reserves = eligiblePlayers.filter(
                    (p) => !selected.has(p.id),
                  );
                  if (reserves.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground">
                        Nenhum reserva disponível.
                      </p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {reserves.map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center gap-3 rounded-md border p-2"
                        >
                          <Avatar name={player.name} size="sm" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {player.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {POSITION_LABELS[player.position]} · Overall{" "}
                              {player.overall}
                            </p>
                          </div>
                          <ConditionBadge condition={player.condition} />
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
