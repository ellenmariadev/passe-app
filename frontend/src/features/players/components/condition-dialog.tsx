"use client";

import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormSelect } from "@/components/shared/form-select";
import { CONDITION_OPTIONS } from "@/lib/domain";
import { getApiErrorMessage } from "@/lib/http";
import { updatePlayerCondition } from "../api";
import {
  updateConditionSchema,
  type UpdateConditionFormValues,
} from "../schemas";
import type { Player } from "../types";

interface ConditionDialogProps {
  player: Player | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (player: Player) => void;
}

export function ConditionDialog({
  player,
  open,
  onOpenChange,
  onSuccess,
}: ConditionDialogProps) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateConditionFormValues>({
    resolver: yupResolver(updateConditionSchema),
  });

  useEffect(() => {
    if (open && player) {
      reset({ condition: player.condition });
    }
  }, [open, player, reset]);

  if (!player) {
    return null;
  }

  const currentPlayer = player;

  const options = CONDITION_OPTIONS.map((option) => ({
    ...option,
    disabled: player.condition === "DOENTE" && option.value === "APTO",
  }));

  async function onSubmit(values: UpdateConditionFormValues) {
    try {
      const updated = await updatePlayerCondition(
        currentPlayer.id,
        values.condition,
      );
      toast.success("Condição física atualizada.");
      onSuccess(updated);
      onOpenChange(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Alterar condição física</DialogTitle>
          <DialogDescription>
            Jogador: {player.name}
            {player.condition === "DOENTE"
              ? ". Jogador doente não pode passar direto para Apto."
              : ""}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormSelect<UpdateConditionFormValues>
            name="condition"
            control={control}
            label="Condição"
            required
            error={errors.condition?.message}
            options={options}
          />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
