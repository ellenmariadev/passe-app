import {
  MAX_PENALTY,
  PURCHASE_FEE_RATE,
  PURCHASE_FEE_THRESHOLD,
} from "../config/constants.js";
import { round2 } from "./round.js";

/** RN13: taxa de compra de 5% do valor de mercado, só acima de 30,00. */
export function calculatePurchaseFee(marketValue: number): number {
  if (marketValue <= PURCHASE_FEE_THRESHOLD) {
    return 0;
  }
  return round2(marketValue * PURCHASE_FEE_RATE);
}

/** RN16: comissão progressiva sobre o lucro, só quando positivo. */
export function calculateCommission(profit: number): number {
  if (profit <= 0) {
    return 0;
  }
  const firstTier = Math.min(profit, 10) * 0.1;
  const secondTier = Math.max(0, profit - 10) * 0.2;
  return round2(firstTier + secondTier);
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** RN15: dias restantes de fidelidade, arredondados para cima (0 se já venceu). */
export function calculateRemainingDays(loyaltyUntil: Date, now: Date): number {
  const diffMs = loyaltyUntil.getTime() - now.getTime();
  if (diffMs <= 0) {
    return 0;
  }
  return Math.ceil(diffMs / DAY_MS);
}

/** RN15: percentual de multa conforme os dias restantes. */
export function calculatePenaltyRate(remainingDays: number): number {
  if (remainingDays <= 0) {
    return 0;
  }
  if (remainingDays <= 30) {
    return 5;
  }
  if (remainingDays <= 180) {
    return 10;
  }
  return 20;
}

/** RN15: multa por fidelidade, limitada ao teto de 10,00. */
export function calculatePenalty(
  marketValue: number,
  remainingDays: number,
): number {
  const rate = calculatePenaltyRate(remainingDays);
  const penalty = round2((marketValue * rate) / 100);
  return Math.min(penalty, MAX_PENALTY);
}
