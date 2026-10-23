"use client";

import { useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/shared/error-state";
import { FormSelect } from "@/components/shared/form-select";
import { getApiErrorMessage } from "@/lib/http";
import { useClubs } from "@/features/clubs/hooks";
import { createMatch } from "../api";
import { matchSchema, type MatchFormValues } from "../schemas";
import type { Match } from "../types";
import { MatchResult } from "./match-result";

type MatchFormProps = {
  onSuccess?: () => void;
};

export function MatchForm({ onSuccess }: MatchFormProps) {
  const { data: clubs, isLoading, error, refetch } = useClubs();
  const [result, setResult] = useState<Match | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<MatchFormValues>({
    resolver: yupResolver(matchSchema),
    defaultValues: { home_club_id: "", away_club_id: "" },
  });

  if (isLoading) {
    return null;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  if (!clubs) {
    return null;
  }

  const clubOptions = clubs.map((club) => ({
    value: String(club.id),
    label: club.name,
  }));

  async function onSubmit(values: MatchFormValues) {
    try {
      const match = await createMatch({
        home_club_id: Number(values.home_club_id),
        away_club_id: Number(values.away_club_id),
      });
      if (onSuccess) {
        onSuccess();
      } else {
        setResult(match);
      }
      toast.success("Partida realizada com sucesso.");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormSelect<MatchFormValues>
            name="home_club_id"
            control={control}
            label="Mandante"
            required
            error={errors.home_club_id?.message}
            options={clubOptions}
            placeholder="Escolha o mandante"
          />
          <FormSelect<MatchFormValues>
            name="away_club_id"
            control={control}
            label="Visitante"
            required
            error={errors.away_club_id?.message}
            options={clubOptions}
            placeholder="Escolha o visitante"
          />
        </div>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Jogando..." : "Jogar partida"}
          </Button>
        </div>
      </form>

      {result ? <MatchResult match={result} /> : null}
    </div>
  );
}
