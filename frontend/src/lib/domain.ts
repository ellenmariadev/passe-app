/**
 * Valores e rótulos de domínio compartilhados entre os módulos.
 * São apenas constantes de apresentação (sem nenhuma regra de negócio).
 */

export type Position = "GOL" | "ZAG" | "LAT" | "MEI" | "ATA";
export type Condition = "APTO" | "MAL_CONDICIONADO" | "DOENTE";

/** Ordem das posições de trás para frente (contrato RN07/RN11). */
export const POSITIONS: Position[] = ["GOL", "ZAG", "LAT", "MEI", "ATA"];
export const CONDITIONS: Condition[] = ["APTO", "MAL_CONDICIONADO", "DOENTE"];

export const POSITION_LABELS: Record<Position, string> = {
  GOL: "Goleiro",
  ZAG: "Zagueiro",
  LAT: "Lateral",
  MEI: "Meia",
  ATA: "Atacante",
};

export const CONDITION_LABELS: Record<Condition, string> = {
  APTO: "Apto",
  MAL_CONDICIONADO: "Mal condicionado",
  DOENTE: "Doente",
};

export const FORMATIONS = ["3-1", "2-2", "2-1-1", "1-2-1"] as const;
export type Formation = (typeof FORMATIONS)[number];

export const FORMATION_OPTIONS = FORMATIONS.map((formation) => ({
  value: formation,
  label: formation,
}));

export const POSITION_OPTIONS = POSITIONS.map((position) => ({
  value: position,
  label: POSITION_LABELS[position],
}));

export const CONDITION_OPTIONS = CONDITIONS.map((condition) => ({
  value: condition,
  label: CONDITION_LABELS[condition],
}));
