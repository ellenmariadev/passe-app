const BRASILIA_OFFSET_MS = -3 * 60 * 60 * 1000;

const DATE_TIME_RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})-03:00$/;

export function parseBrasiliaDateTime(input: string): Date | null {
  if (typeof input !== "string") {
    return null;
  }
  const match = DATE_TIME_RE.exec(input);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  if (month < 1 || month > 12) {
    return null;
  }
  if (day < 1 || day > 31) {
    return null;
  }
  if (hour > 23 || minute > 59) {
    return null;
  }

  const wallClock = new Date(
    Date.UTC(year, month - 1, day, hour, minute, 0, 0),
  );
  if (
    wallClock.getUTCFullYear() !== year ||
    wallClock.getUTCMonth() !== month - 1 ||
    wallClock.getUTCDate() !== day ||
    wallClock.getUTCHours() !== hour ||
    wallClock.getUTCMinutes() !== minute
  ) {
    return null;
  }

  return new Date(wallClock.getTime() - BRASILIA_OFFSET_MS);
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export function formatBrasiliaDateTime(date: Date): string {
  const wallClock = new Date(date.getTime() + BRASILIA_OFFSET_MS);
  const year = wallClock.getUTCFullYear();
  const month = pad(wallClock.getUTCMonth() + 1);
  const day = pad(wallClock.getUTCDate());
  const hour = pad(wallClock.getUTCHours());
  const minute = pad(wallClock.getUTCMinutes());
  const second = pad(wallClock.getUTCSeconds());
  return `${year}-${month}-${day}T${hour}:${minute}:${second}-03:00`;
}
