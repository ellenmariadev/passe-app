export function hasControlCharacters(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i);
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) {
      return true;
    }
  }
  return false;
}

/** V4: remove espaços do início e do fim e reduz espaços repetidos a um só. */
export function collapseSpaces(value: string): string {
  return value.replace(/ {2,}/g, " ").trim();
}

/** Ignora acentos: decompõe em NFD e remove as marcas (categoria Mn). */
export function stripAccents(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

/** Chave de ordenação alfabética (Premissas): sem acentos e em minúsculas. */
export function normalizeForSort(value: string): string {
  return stripAccents(value).toLowerCase();
}

export function hasDigit(value: string): boolean {
  return /[0-9]/.test(value);
}

export function countWords(value: string): number {
  return value.split(" ").filter((word) => /[\p{L}]/u.test(word)).length;
}

/** Normaliza para o banco: minúsculas, mantendo os acentos (RN10). */
export function normalizeClubNameForUniqueness(value: string): string {
  return value.toLowerCase();
}

/** Comparador alfabético (Premissas): nome normalizado e, no empate, id crescente. */
export function compareByName(
  nameA: string,
  idA: number,
  nameB: string,
  idB: number,
): number {
  const a = normalizeForSort(nameA);
  const b = normalizeForSort(nameB);
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return idA - idB;
}
