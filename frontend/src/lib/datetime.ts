/**
 * Conversões de data e hora no fuso de Brasília (sempre `-03:00`, sem horário
 * de verão). A API envia e devolve datas no formato `AAAA-MM-DDTHH:MM:SS-03:00`
 * e exige, nas requisições, `AAAA-MM-DDTHH:MM-03:00`.
 *
 * A conversão é feita por manipulação do texto do relógio de Brasília, sem
 * depender do fuso configurado na máquina do usuário.
 */

/** Converte o valor de um `<input type="datetime-local">` no formato exigido pela API. */
export function toBrasiliaApiDateTime(localValue: string): string {
  if (!localValue) {
    return "";
  }
  // localValue: "AAAA-MM-DDTHH:MM" -> API espera "AAAA-MM-DDTHH:MM-03:00"
  return `${localValue}-03:00`;
}

/** Formata uma data da API para exibição: "DD/MM/AAAA HH:MM". */
export function formatBrasiliaDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  const date = iso.slice(0, 10);
  const time = iso.slice(11, 16);
  return `${date.slice(8, 10)}/${date.slice(5, 7)}/${date.slice(0, 4)} ${time}`;
}

/** Converte uma data da API para o valor de um `<input type="datetime-local">`. */
export function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return "";
  }
  return iso.slice(0, 16);
}

/** Relógio de Brasília atual como valor de `<input type="datetime-local">`. */
export function brasiliaNowLocalValue(): string {
  const now = new Date(Date.now() - 3 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 16);
}

/** Relógio de Brasília deslocado em `days` dias, para valores padrão de formulário. */
export function brasiliaFutureLocalValue(days: number): string {
  const target = new Date(
    Date.now() - 3 * 60 * 60 * 1000 + days * 24 * 60 * 60 * 1000,
  );
  return target.toISOString().slice(0, 16);
}
