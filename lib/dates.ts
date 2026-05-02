/** Normalize to YYYY-MM-DD in UTC (ISO calendar date). */
export function toDateKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDateKeyUTC(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

/** Inclusive range of UTC date keys from squad bounds. */
export function eachDateKeyInRange(startDate: Date, endDate: Date): string[] {
  const keys: string[] = [];
  let cur = parseDateKeyUTC(toDateKeyUTC(startDate));
  const end = parseDateKeyUTC(toDateKeyUTC(endDate));
  while (cur.getTime() <= end.getTime()) {
    keys.push(toDateKeyUTC(cur));
    cur = new Date(cur.getTime() + 86400000);
  }
  return keys;
}

/**
 * e.g. "Mon (May 1)" — weekday short + month short + day, evaluated in UTC
 * to match stored date keys.
 */
export function formatColumnHeader(dateKey: string): string {
  const d = parseDateKeyUTC(dateKey);
  const weekday = d.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: "UTC",
  });
  const monthDay = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
  return `${weekday} (${monthDay})`;
}

export function parseBodyDateToUTCStart(input: string): Date {
  const trimmed = input.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    throw new Error("Invalid date format; use YYYY-MM-DD");
  }
  return parseDateKeyUTC(trimmed);
}

export function dateKeyInRange(
  dateKey: string,
  startDate: Date,
  endDate: Date,
): boolean {
  const d = dateKey;
  const s = toDateKeyUTC(startDate);
  const e = toDateKeyUTC(endDate);
  return d >= s && d <= e;
}
