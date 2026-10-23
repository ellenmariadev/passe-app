"use client";

import { useRouter } from "next/navigation";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { POSITION_OPTIONS } from "@/lib/domain";
import { getApiErrorMessage } from "@/lib/http";
import { updatePlayer } from "../api";
import { updatePlayerSchema, type UpdatePlayerFormValues } from "../schemas";
import type { Player } from "../types";

export function PlayerEditForm({ player }: { player: Player }) {
  const router = useRouter();
  const hasClub = player.club_id !== null;

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePlayerFormValues>({
    resolver: yupResolver(updatePlayerSchema),
    defaultValues: {
      name: player.name,
      position: player.position,
      agility: player.agility,
      age: player.age,
    },
  });

  async function onSubmit(values: UpdatePlayerFormValues) {
    try {
      await updatePlayer(player.id, {
        name: values.name,
        position: values.position,
        agility: values.agility,
        age: values.age,
      });
      toast.success("Jogador atualizado com sucesso.");
      router.push(`/players/${player.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nome"
          htmlFor="name"
          required
          error={errors.name?.message}
          className="sm:col-span-2"
        >
          <Input
            id="name"
            placeholder="Ex.: Meia Lua"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>

        <FormSelect<UpdatePlayerFormValues>
          name="position"
          control={control}
          label="Posição"
          required
          error={errors.position?.message}
          options={POSITION_OPTIONS}
          disabled={hasClub}
        />

        <FormField
          label="Agilidade"
          htmlFor="agility"
          required
          error={errors.agility?.message}
        >
          <Input
            id="agility"
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.agility}
            {...register("agility", { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Idade"
          htmlFor="age"
          required
          description={hasClub ? undefined : "A idade não pode diminuir."}
          error={errors.age?.message}
        >
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={player.age}
            aria-invalid={!!errors.age}
            {...register("age", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      {hasClub ? (
        <p className="text-sm text-muted-foreground">
          Jogadores com clube não podem mudar de posição.
        </p>
      ) : null}

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>
    </form>
  );
}
