"use client";

import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { getApiErrorMessage } from "@/lib/http";
import { createClub } from "../api";
import { createClubSchema, type CreateClubFormValues } from "../schemas";
import type { Club } from "../types";

type ClubFormProps = {
  onSuccess?: (club: Club) => void;
};

export function ClubForm({ onSuccess }: ClubFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateClubFormValues>({
    resolver: yupResolver(createClubSchema),
  });

  async function onSubmit(values: CreateClubFormValues) {
    try {
      const club = await createClub({
        name: values.name,
        acronym: values.acronym,
      });
      toast.success("Clube criado com sucesso.");
      onSuccess?.(club);
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
        >
          <Input
            id="name"
            placeholder="Ex.: Águias FC"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </FormField>

        <FormField
          label="Sigla"
          htmlFor="acronym"
          required
          description="3 letras maiúsculas que aparecem no nome, em ordem."
          error={errors.acronym?.message}
        >
          <Input
            id="acronym"
            placeholder="Ex.: AGU"
            maxLength={3}
            className="uppercase"
            aria-invalid={!!errors.acronym}
            {...register("acronym")}
          />
        </FormField>
      </div>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : "Criar clube"}
        </Button>
      </div>
    </form>
  );
}
