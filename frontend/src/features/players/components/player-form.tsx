"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import { POSITION_OPTIONS } from "@/lib/domain";
import { getApiErrorMessage } from "@/lib/http";
import { createPlayer } from "../api";
import { createPlayerSchema, type CreatePlayerFormValues } from "../schemas";
import type { Player } from "../types";

const ATTRIBUTE_FIELDS = [
  { key: "pace", label: "Velocidade" },
  { key: "shooting", label: "Finalização" },
  { key: "passing", label: "Passe" },
  { key: "dribbling", label: "Drible" },
  { key: "defending", label: "Defesa" },
  { key: "physical", label: "Físico" },
] as const;

type PlayerFormProps = {
  onSuccess?: (player: Player) => void;
};

export function PlayerForm({ onSuccess }: PlayerFormProps) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePlayerFormValues>({
    resolver: yupResolver(createPlayerSchema),
  });

  async function onSubmit(values: CreatePlayerFormValues) {
    try {
      const player = await createPlayer({
        name: values.name,
        position: values.position,
        agility: values.agility,
        age: values.age,
        pace: values.pace,
        shooting: values.shooting,
        passing: values.passing,
        dribbling: values.dribbling,
        defending: values.defending,
        physical: values.physical,
        potential: values.potential,
      });
      toast.success("Jogador cadastrado com sucesso.");
      onSuccess?.(player);
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

        <FormSelect<CreatePlayerFormValues>
          name="position"
          control={control}
          label="Posição"
          required
          error={errors.position?.message}
          options={POSITION_OPTIONS}
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
          error={errors.age?.message}
        >
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            aria-invalid={!!errors.age}
            {...register("age", { valueAsNumber: true })}
          />
        </FormField>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold">Indicadores técnicos</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ATTRIBUTE_FIELDS.map((field) => (
            <FormField
              key={field.key}
              label={field.label}
              htmlFor={field.key}
              required
              error={errors[field.key]?.message}
            >
              <Input
                id={field.key}
                type="number"
                inputMode="numeric"
                aria-invalid={!!errors[field.key]}
                {...register(field.key, { valueAsNumber: true })}
              />
            </FormField>
          ))}
          <FormField
            label="Potencial"
            htmlFor="potential"
            required
            error={errors.potential?.message}
          >
            <Input
              id="potential"
              type="number"
              inputMode="numeric"
              aria-invalid={!!errors.potential}
              {...register("potential", { valueAsNumber: true })}
            />
          </FormField>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Cadastrar jogador"}
        </Button>
      </div>
    </form>
  );
}
