"use client";

import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { FormSelect } from "@/components/shared/form-select";
import {
  brasiliaFutureLocalValue,
  brasiliaNowLocalValue,
  formatBrasiliaDateTime,
  toBrasiliaApiDateTime,
} from "@/lib/datetime";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/http";
import type { Club } from "@/features/clubs/types";
import type { Player } from "@/features/players/types";
import { buyPlayer } from "../api";
import { buySchema, type BuyFormValues } from "../schemas";
import type { BuyResult } from "../types";

interface BuyFormProps {
  player: Player | null;
  clubs: Club[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function BuyForm({
  player,
  clubs,
  open,
  onOpenChange,
  onSuccess,
}: BuyFormProps) {
  const [result, setResult] = useState<BuyResult | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BuyFormValues>({
    resolver: yupResolver(buySchema),
    defaultValues: {
      club_id: "",
      loyalty_until: brasiliaFutureLocalValue(365),
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        club_id: "",
        loyalty_until: brasiliaFutureLocalValue(365),
      });
      setResult(null);
    }
  }, [open, reset]);

  if (!player) {
    return null;
  }

  const currentPlayer = player;

  const clubOptions = clubs.map((club) => ({
    value: String(club.id),
    label: club.name,
  }));

  async function onSubmit(values: BuyFormValues) {
    try {
      const res = await buyPlayer(currentPlayer.id, {
        club_id: Number(values.club_id),
        loyalty_until: toBrasiliaApiDateTime(values.loyalty_until),
      });
      setResult(res);
      toast.success("Compra realizada com sucesso.");
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Comprar jogador</DialogTitle>
          <DialogDescription>
            {player.name} — valor de mercado{" "}
            {formatCurrency(player.market_value)}
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <BuyResultView result={result} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormSelect<BuyFormValues>
              name="club_id"
              control={control}
              label="Clube comprador"
              required
              error={errors.club_id?.message}
              options={clubOptions}
              placeholder="Selecione o clube"
            />

            <FormField
              label="Fim da fidelidade"
              htmlFor="loyalty_until"
              required
              description="Data e hora no horário de Brasília."
              error={errors.loyalty_until?.message}
            >
              <Input
                id="loyalty_until"
                type="datetime-local"
                min={brasiliaNowLocalValue()}
                aria-invalid={!!errors.loyalty_until}
                {...register("loyalty_until")}
              />
            </FormField>

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
                {isSubmitting ? "Comprando..." : "Confirmar compra"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function BuyResultView({ result }: { result: BuyResult }) {
  const totalCost = result.value + result.fee;
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
      <ResultRow
        label="Valor de mercado"
        value={formatCurrency(result.value)}
      />
      <ResultRow label="Taxa" value={formatCurrency(result.fee)} />
      <ResultRow
        label="Custo total"
        value={formatCurrency(totalCost)}
        emphasize
      />
      <ResultRow
        label="Fim da fidelidade"
        value={formatBrasiliaDateTime(result.contract.loyalty_until)}
      />
      <ResultRow
        label="Novo caixa do clube"
        value={formatCurrency(result.club_cash)}
        emphasize
      />
    </div>
  );
}

function ResultRow({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? "font-semibold" : "font-medium"}>
        {value}
      </span>
    </div>
  );
}
