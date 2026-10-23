import { round2 } from "./round.js";

export interface PlayerAttributes {
  velocidade: number;
  finalizacao: number;
  passe: number;
  drible: number;
  defesa: number;
  fisico: number;
}

export type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA";

/** Ordem das posições, de trás para frente (RN07, RN11, RN19 e RN20). */
export const POSITION_ORDER: Record<Position, number> = {
  GOL: 0,
  ZAG: 1,
  LAT: 2,
  MEI: 3,
  ATA: 4,
};

const POSITION_WEIGHTS: Record<Position, PlayerAttributes> = {
  GOL: {
    velocidade: 10,
    finalizacao: 0,
    passe: 20,
    drible: 0,
    defesa: 40,
    fisico: 30,
  },
  ZAG: {
    velocidade: 10,
    finalizacao: 0,
    passe: 15,
    drible: 0,
    defesa: 45,
    fisico: 30,
  },
  LAT: {
    velocidade: 25,
    finalizacao: 0,
    passe: 20,
    drible: 15,
    defesa: 25,
    fisico: 15,
  },
  MEI: {
    velocidade: 10,
    finalizacao: 15,
    passe: 35,
    drible: 25,
    defesa: 5,
    fisico: 10,
  },
  ATA: {
    velocidade: 20,
    finalizacao: 40,
    passe: 10,
    drible: 20,
    defesa: 0,
    fisico: 10,
  },
};

/** RN06: overall calculado pelos pesos da posição, arredondado para inteiro (meio para cima). */
export function calculateOverall(
  position: Position,
  attributes: PlayerAttributes,
): number {
  const weights = POSITION_WEIGHTS[position];
  const weightedSum =
    attributes.velocidade * weights.velocidade +
    attributes.finalizacao * weights.finalizacao +
    attributes.passe * weights.passe +
    attributes.drible * weights.drible +
    attributes.defesa * weights.defesa +
    attributes.fisico * weights.fisico;
  return Math.round(weightedSum / 100);
}

/** RN06: valor base calculado uma única vez, no cadastro. */
export function calculateBaseValue(
  position: Position,
  attributes: PlayerAttributes,
  potential: number,
  ageAtCreation: number,
): number {
  const overall = calculateOverall(position, attributes);
  return calculateBaseValueFromOverall(overall, potential, ageAtCreation);
}

/** RN06, passo 3: parte do overall progressiva + jovem promessa + piso. */
export function calculateBaseValueFromOverall(
  overall: number,
  potential: number,
  ageAtCreation: number,
): number {
  let overallPart = 0;
  if (overall > 40 && overall <= 60) {
    overallPart = (overall - 40) * 0.5;
  } else if (overall > 60 && overall <= 75) {
    overallPart = 20 * 0.5 + (overall - 60) * 2.0;
  } else if (overall > 75) {
    overallPart = 20 * 0.5 + 15 * 2.0 + (overall - 75) * 6.0;
  }

  if (ageAtCreation <= 21) {
    overallPart = (overallPart * (100 + potential - overall)) / 100;
  }

  const baseValue = round2(overallPart);
  return baseValue < 1.0 ? 1.0 : baseValue;
}

export interface MarketValueInput {
  baseValue: number;
  condition: string;
  agility: number;
  age: number;
}

/** RN02 a RN05: valor de mercado calculado a cada consulta. */
export function calculateMarketValue(input: MarketValueInput): number {
  const { baseValue, condition, agility, age } = input;

  let conditionDiscount = 0;
  if (condition === "MAL_CONDICIONADO") {
    conditionDiscount = 15;
  } else if (condition === "DOENTE") {
    conditionDiscount = 30;
  }

  if (condition !== "APTO") {
    if (agility >= 80 && agility <= 100) {
      conditionDiscount = conditionDiscount / 2;
    } else if (agility >= 1 && agility <= 30) {
      conditionDiscount = conditionDiscount + 10;
    }
  }

  let ageAdjustment = 0;
  if (age <= 21) {
    ageAdjustment = 10;
  } else if (age >= 32) {
    ageAdjustment = -10;
  }

  let totalPercent = ageAdjustment - conditionDiscount;
  if (totalPercent < -40) {
    totalPercent = -40;
  }

  let marketValue = (baseValue * (100 + totalPercent)) / 100;
  marketValue = round2(marketValue);

  return marketValue < 1.0 ? 1.0 : marketValue;
}
