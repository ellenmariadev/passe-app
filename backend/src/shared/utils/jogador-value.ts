import type { Jogador } from "@/generated/prisma/client.js";
import { calculateMarketValue } from "./players.js";

/** Valor de mercado atual de um jogador (RN05), sem depender do DTO de resposta. */
export function marketValueOf(jogador: Jogador): number {
  return calculateMarketValue({
    baseValue: Number(jogador.valorBase),
    condition: jogador.condicao,
    agility: jogador.agilidade,
    age: jogador.idade,
  });
}
