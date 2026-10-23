import type { APIRequestContext } from "@playwright/test";

function randomWord(length: number): string {
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  let out = "";
  for (let i = 0; i < length; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

function randomLetter(exclude: string): string {
  const alphabet = "bcdefghijklmnopqrstuvwxyz";
  let letter = alphabet[Math.floor(Math.random() * alphabet.length)];
  while (exclude.includes(letter)) {
    letter = alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return letter;
}

export function uniquePlayerName(): string {
  return `Teste ${randomWord(8)}`;
}

export function uniqueClub(): { name: string; acronym: string } {
  const a = randomLetter("c");
  const b = randomLetter(`c${a}`);
  return {
    name: `Clube ${a}${randomWord(3)} ${b}${randomWord(3)}`,
    acronym: `C${a}${b}`.toUpperCase(),
  };
}

export interface TestPlayer {
  id: number;
  name: string;
}

export async function createPlayer(
  request: APIRequestContext,
  overrides: Record<string, unknown> = {},
): Promise<TestPlayer> {
  const payload = {
    name: uniquePlayerName(),
    position: "MEI",
    agility: 70,
    age: 25,
    pace: 70,
    shooting: 68,
    passing: 82,
    dribbling: 79,
    defending: 55,
    physical: 64,
    potential: 86,
    ...overrides,
  };
  const response = await request.post("/api/v1/players", { data: payload });
  const body = await response.json();
  return body as TestPlayer;
}

export interface TestClub {
  id: number;
  name: string;
  acronym: string;
}

export async function createClub(
  request: APIRequestContext,
): Promise<TestClub> {
  const data = uniqueClub();
  const response = await request.post("/api/v1/clubs", { data });
  const body = await response.json();
  return body as TestClub;
}
