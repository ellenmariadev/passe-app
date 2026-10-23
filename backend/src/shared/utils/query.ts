import { BadRequestException } from "@nestjs/common";
import { MAX_ID } from "../config/constants.js";
import { collapseSpaces, hasControlCharacters } from "./names.js";

const POSITIVE_INT_RE = /^[1-9]\d*$/;
const DECIMAL_RE = /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/;

function isPresent(value: unknown): boolean {
  return value !== undefined && value !== null;
}

function parsePositiveInt(value: unknown, name: string): number | null {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value !== "string" || !POSITIVE_INT_RE.test(value)) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed > MAX_ID) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  return parsed;
}

export function parseClubIdQuery(value: unknown): number | null {
  return parsePositiveInt(value, "club_id");
}

export function parsePlayerIdQuery(value: unknown): number | null {
  return parsePositiveInt(value, "player_id");
}

export function parsePage(value: unknown): number {
  if (!isPresent(value)) {
    return 1;
  }
  const parsed = parsePositiveInt(value, "page");
  if (parsed === null) {
    throw new BadRequestException("Parâmetro page inválido.");
  }
  return parsed;
}

export function parseLimit(value: unknown): number {
  if (!isPresent(value)) {
    return 10;
  }
  const parsed = parsePositiveInt(value, "limit");
  if (parsed === null || parsed < 1 || parsed > 50) {
    throw new BadRequestException("Parâmetro limit inválido.");
  }
  return parsed;
}

export function parseAge(
  value: unknown,
  name: "min_age" | "max_age",
): number | null {
  if (!isPresent(value)) {
    return null;
  }
  const parsed = parsePositiveInt(value, name);
  if (parsed === null || parsed < 16 || parsed > 45) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  return parsed;
}

export function parseMoneyFilter(
  value: unknown,
  name: "min_value" | "max_value",
): number | null {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value !== "string" || !DECIMAL_RE.test(value)) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  const parsed = Number(value);
  if (parsed > 550) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  return parsed;
}

function parseEnum(
  value: unknown,
  name: string,
  allowed: readonly string[],
): string | null {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value !== "string" || !allowed.includes(value)) {
    throw new BadRequestException(`Parâmetro ${name} inválido.`);
  }
  return value;
}

export const POSITIONS = ["GOL", "ZAG", "LAT", "MEI", "ATA"] as const;
export const CONDITIONS = ["APTO", "MAL_CONDICIONADO", "DOENTE"] as const;

export function parsePosition(value: unknown): string | null {
  return parseEnum(value, "position", POSITIONS);
}

export function parseCondition(value: unknown): string | null {
  return parseEnum(value, "condition", CONDITIONS);
}

export function parseFree(value: unknown): boolean | null {
  if (!isPresent(value)) {
    return null;
  }
  if (value === "true") {
    return true;
  }
  if (value === "false") {
    return false;
  }
  throw new BadRequestException("Parâmetro free inválido.");
}

const PLAYER_SORTS = [
  "name",
  "value_asc",
  "value_desc",
  "age_asc",
  "age_desc",
  "position",
] as const;

const PLAYER_SORT_FIELDS: Record<string, string> = {
  name: "name",
  value_asc: "value",
  value_desc: "value",
  age_asc: "age",
  age_desc: "age",
  position: "position",
};

export function parsePlayerSort(value: unknown): string[] {
  if (!isPresent(value)) {
    return ["name"];
  }
  if (typeof value !== "string") {
    throw new BadRequestException("Parâmetro sort inválido.");
  }
  const parts = value.split(",");
  if (parts.length < 1 || parts.length > 2) {
    throw new BadRequestException("Parâmetro sort inválido.");
  }
  for (const part of parts) {
    if (!PLAYER_SORTS.includes(part as (typeof PLAYER_SORTS)[number])) {
      throw new BadRequestException("Parâmetro sort inválido.");
    }
  }
  if (
    parts.length === 2 &&
    PLAYER_SORT_FIELDS[parts[0]] === PLAYER_SORT_FIELDS[parts[1]]
  ) {
    throw new BadRequestException("Parâmetro sort inválido.");
  }
  return parts;
}

const CLUB_SORTS = ["name", "net_worth_asc", "net_worth_desc"] as const;

export function parseClubSort(value: unknown): string {
  if (!isPresent(value)) {
    return "name";
  }
  if (
    typeof value !== "string" ||
    !CLUB_SORTS.includes(value as (typeof CLUB_SORTS)[number])
  ) {
    throw new BadRequestException("Parâmetro sort inválido.");
  }
  return value;
}

const TRANSACTION_TYPES = ["COMPRA", "VENDA"] as const;

export function parseTransactionTypes(value: unknown): string[] | null {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value !== "string") {
    throw new BadRequestException("Parâmetro type inválido.");
  }
  const parts = value.split(",");
  if (parts.length < 1 || parts.length > 2) {
    throw new BadRequestException("Parâmetro type inválido.");
  }
  const seen = new Set<string>();
  for (const part of parts) {
    if (
      !TRANSACTION_TYPES.includes(part as (typeof TRANSACTION_TYPES)[number])
    ) {
      throw new BadRequestException("Parâmetro type inválido.");
    }
    if (seen.has(part)) {
      throw new BadRequestException("Parâmetro type inválido.");
    }
    seen.add(part);
  }
  return parts;
}

export function parseSearch(value: unknown): string | null {
  if (!isPresent(value)) {
    return null;
  }
  if (typeof value !== "string") {
    throw new BadRequestException("Parâmetro search inválido.");
  }
  if (hasControlCharacters(value)) {
    throw new BadRequestException("Parâmetro search inválido.");
  }
  const normalized = collapseSpaces(value);
  if (normalized.length < 2 || normalized.length > 100) {
    throw new BadRequestException("Parâmetro search inválido.");
  }
  return normalized;
}
