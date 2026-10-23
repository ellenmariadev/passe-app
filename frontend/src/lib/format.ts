/** Formata um valor em moedas com 2 casas e vírgula decimal (ex.: 1234,56). */
export function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }
  return value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Formata uma variação de caixa com sinal explícito ("+" ou "-"). */
export function formatSignedCurrency(value: number): string {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}${formatCurrency(Math.abs(value))}`;
}
