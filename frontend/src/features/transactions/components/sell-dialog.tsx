"use client";

import { useEffect, useState } from "react";
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
import { formatBrasiliaDateTime } from "@/lib/datetime";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/lib/http";
import type { SquadPlayer } from "@/features/players/types";
import { sellPlayer } from "../api";
import type { SellResult } from "../types";

interface SellDialogProps {
  player: SquadPlayer | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function SellDialog({
  player,
  open,
  onOpenChange,
  onSuccess,
}: SellDialogProps) {
  const [result, setResult] = useState<SellResult | null>(null);
  const [isSelling, setIsSelling] = useState(false);

  useEffect(() => {
    if (open) {
      setResult(null);
    }
  }, [open]);

  if (!player) {
    return null;
  }

  const currentPlayer = player;

  async function handleSell() {
    setIsSelling(true);
    try {
      const res = await sellPlayer(currentPlayer.id);
      setResult(res);
      toast.success("Venda realizada com sucesso.");
      onSuccess();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setIsSelling(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Vender jogador</DialogTitle>
          <DialogDescription>
            Confirme a venda de {player.name}.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <SellResultView result={result} />
        ) : (
          <div className="space-y-4">
            <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">Valor de mercado</span>
                <span className="font-semibold">
                  {formatCurrency(player.market_value)}
                </span>
              </div>
              {player.contract ? (
                <>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Fim da fidelidade
                    </span>
                    <span className="font-medium">
                      {formatBrasiliaDateTime(player.contract.loyalty_until)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">
                      Dias restantes
                    </span>
                    <span className="font-medium">
                      {player.contract.remaining_days}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">% de multa</span>
                    <span className="font-medium">
                      {player.contract.penalty_rate}%
                    </span>
                  </div>
                </>
              ) : null}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSelling}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleSell}
                disabled={isSelling}
              >
                {isSelling ? "Vendendo..." : "Confirmar venda"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function SellResultView({ result }: { result: SellResult }) {
  return (
    <div className="space-y-2 rounded-lg border bg-muted/30 p-4 text-sm">
      <ResultRow
        label="Valor de compra"
        value={formatCurrency(result.purchase_value)}
      />
      <ResultRow label="Valor de venda" value={formatCurrency(result.value)} />
      <ResultRow label="Dias restantes" value={String(result.remaining_days)} />
      <ResultRow label="Multa" value={formatCurrency(result.penalty)} />
      <ResultRow label="Lucro" value={formatCurrency(result.profit)} />
      <ResultRow label="Comissão" value={formatCurrency(result.fee)} />
      <ResultRow
        label="Crédito no caixa"
        value={formatCurrency(result.cash_change)}
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
