import { describe, expect, it } from "vitest";
import {
  calculateBaseValueFromOverall,
  calculateMarketValue,
  calculateOverall,
} from "./players.js";
import {
  calculateCommission,
  calculatePenalty,
  calculatePenaltyRate,
  calculatePurchaseFee,
  calculateRemainingDays,
} from "./fees.js";
import { round2 } from "./round.js";

describe("calculateOverall (RN06)", () => {
  it("aplica os pesos por posição e arredonda com meio para cima", () => {
    expect(
      calculateOverall("MEI", {
        velocidade: 68,
        finalizacao: 65,
        passe: 80,
        drible: 78,
        defesa: 52,
        fisico: 60,
      }),
    ).toBe(73);
    expect(
      calculateOverall("ATA", {
        velocidade: 78,
        finalizacao: 75,
        passe: 73,
        drible: 82,
        defesa: 48,
        fisico: 68,
      }),
    ).toBe(76);
    expect(
      calculateOverall("LAT", {
        velocidade: 72,
        finalizacao: 70,
        passe: 78,
        drible: 76,
        defesa: 70,
        fisico: 66,
      }),
    ).toBe(72);
    expect(
      calculateOverall("ZAG", {
        velocidade: 50,
        finalizacao: 90,
        passe: 60,
        drible: 40,
        defesa: 80,
        fisico: 75,
      }),
    ).toBe(73);
    expect(
      calculateOverall("GOL", {
        velocidade: 55,
        finalizacao: 30,
        passe: 65,
        drible: 40,
        defesa: 72,
        fisico: 68,
      }),
    ).toBe(68);
  });
});

describe("calculateBaseValueFromOverall (RN06)", () => {
  it("aplica as faixas progressivas do overall", () => {
    expect(calculateBaseValueFromOverall(75, 86, 25)).toBe(40.0);
    expect(calculateBaseValueFromOverall(60, 70, 30)).toBe(10.0);
    expect(calculateBaseValueFromOverall(61, 70, 30)).toBe(12.0);
    expect(calculateBaseValueFromOverall(76, 80, 22)).toBe(46.0);
    expect(calculateBaseValueFromOverall(85, 92, 27)).toBe(100.0);
  });

  it("aplica o bônus de jovem promessa", () => {
    expect(calculateBaseValueFromOverall(70, 84, 21)).toBe(34.2);
    expect(calculateBaseValueFromOverall(70, 84, 22)).toBe(30.0);
    expect(calculateBaseValueFromOverall(45, 90, 18)).toBe(3.63);
  });

  it("aplica o piso de 1,00", () => {
    expect(calculateBaseValueFromOverall(40, 66, 36)).toBe(1.0);
  });
});

describe("calculateMarketValue (RN02 a RN05)", () => {
  it.each([
    [82.0, "APTO", 20, 25, 82.0],
    [82.0, "APTO", 50, 19, 90.2],
    [82.0, "MAL_CONDICIONADO", 50, 25, 69.7],
    [82.0, "MAL_CONDICIONADO", 80, 21, 84.05],
    [82.0, "MAL_CONDICIONADO", 30, 33, 53.3],
    [82.0, "DOENTE", 90, 25, 69.7],
    [82.0, "DOENTE", 30, 25, 49.2],
    [82.0, "DOENTE", 10, 40, 49.2],
    [9.5, "MAL_CONDICIONADO", 85, 25, 8.79],
    [1.0, "MAL_CONDICIONADO", 50, 35, 1.0],
  ])(
    "base %f, %s, agilidade %d, idade %d → %f",
    (baseValue, condition, agility, age, expected) => {
      expect(calculateMarketValue({ baseValue, condition, agility, age })).toBe(
        expected,
      );
    },
  );
});

describe("calculatePurchaseFee (RN13)", () => {
  it("cobra 5% só acima de 30,00", () => {
    expect(calculatePurchaseFee(28.0)).toBe(0);
    expect(calculatePurchaseFee(30.0)).toBe(0);
    expect(calculatePurchaseFee(30.01)).toBe(1.5);
  });
});

describe("calculateRemainingDays e calculatePenalty (RN15)", () => {
  it("arredonda os dias restantes para cima", () => {
    const base = new Date("2026-11-05T16:40:00-03:00");
    const loyalty = new Date("2027-03-02T10:15:00-03:00");
    expect(calculateRemainingDays(loyalty, base)).toBe(117);
  });

  it("retorna 0 quando a fidelidade já venceu", () => {
    const now = new Date("2026-11-05T16:40:00-03:00");
    expect(
      calculateRemainingDays(new Date("2026-11-05T16:39:00-03:00"), now),
    ).toBe(0);
  });

  it("mapeia as faixas de multa", () => {
    expect(calculatePenaltyRate(0)).toBe(0);
    expect(calculatePenaltyRate(30)).toBe(5);
    expect(calculatePenaltyRate(31)).toBe(10);
    expect(calculatePenaltyRate(180)).toBe(10);
    expect(calculatePenaltyRate(181)).toBe(20);
  });

  it("limita a multa ao teto de 10,00", () => {
    expect(calculatePenalty(76.0, 200)).toBe(10.0);
    expect(calculatePenalty(40.0, 117)).toBe(4.0);
  });
});

describe("calculateCommission (RN16)", () => {
  it("cobra comissão progressiva só sobre o lucro", () => {
    expect(calculateCommission(3.0)).toBe(0.3);
    expect(calculateCommission(3.85)).toBe(0.39);
    expect(calculateCommission(10.0)).toBe(1.0);
    expect(calculateCommission(10.01)).toBe(1.0);
    expect(calculateCommission(15.0)).toBe(2.0);
    expect(calculateCommission(-7.5)).toBe(0);
  });
});

describe("round2", () => {
  it("arredonda meio para longe do zero", () => {
    expect(round2(14.775)).toBe(14.78);
    expect(round2(0.385)).toBe(0.39);
  });
});
