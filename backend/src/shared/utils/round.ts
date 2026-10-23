/**
 * Arredondamento monetário (Premissas): uma única vez, no resultado final, para
 * 2 casas, com meio para longe do zero (14,775 → 14,78; 0,385 → 0,39).
 *
 * O pequeno acréscimo compensa o erro de representação em ponto flutuante dos
 * valores que caem exatamente em meio centavo.
 */
export function round2(value: number): number {
  return Math.round((value + 1e-9) * 100) / 100;
}
