/** Normalize to YYYY-MM-DD in UTC (ISO calendar date). */
export function toDateKeyUTC(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function parseDateKeyUTC(key: string): Date {
  return new Date(`${key}T00:00:00.000Z`);
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/** Civil calendar YYYY-MM-DD for this instant in an IANA time zone. */
export function formatCalendarDateInTZ(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  return `${y}-${m}-${d}`;
}

/** Inclusive Gregorian days from startYmd to endYmd (YYYY-MM-DD strings). */
export function eachGregorianDayInclusive(startYmd: string, endYmd: string): string[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startYmd) || !/^\d{4}-\d{2}-\d{2}$/.test(endYmd)) {
    return [];
  }
  if (startYmd > endYmd) {
    return [];
  }
  const keys: string[] = [];
  const [sy, sm, sd] = startYmd.split("-").map(Number);
  let y = sy;
  let m = sm;
  let d = sd;
  const end = endYmd;
  for (let guard = 0; guard < 4000; guard++) {
    const cur = `${y}-${pad2(m)}-${pad2(d)}`;
    keys.push(cur);
    if (cur === end) {
      break;
    }
    const next = new Date(Date.UTC(y, m - 1, d + 1));
    y = next.getUTCFullYear();
    m = next.getUTCMonth() + 1;
    d = next.getUTCDate();
  }
  return keys;
}

/** Inclusive range of UTC calendar date keys from squad bounds (legacy / neutral). */
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
 * Inclusive squad day columns. With `timeZone`, range uses that zone’s calendar
 * for the squad start/end instants so “tomorrow” locally matches API checks.
 */
export function eachSquadDayKeys(
  startDate: Date,
  endDate: Date,
  timeZone?: string | null,
): string[] {
  if (!timeZone || timeZone === "UTC") {
    return eachDateKeyInRange(startDate, endDate);
  }
  try {
    const startK = formatCalendarDateInTZ(startDate, timeZone);
    const endK = formatCalendarDateInTZ(endDate, timeZone);
    return eachGregorianDayInclusive(startK, endK);
  } catch {
    return eachDateKeyInRange(startDate, endDate);
  }
}

export function squadAllowsDateKey(
  dateKey: string,
  startDate: Date,
  endDate: Date,
  timeZone?: string | null,
): boolean {
  return eachSquadDayKeys(startDate, endDate, timeZone).includes(dateKey);
}

/** Today's civil YYYY-MM-DD in the given IANA zone (UTC if missing/invalid). */
export function todayCalendarKeyInTZ(timeZone?: string | null): string {
  const tz =
    timeZone && typeof timeZone === "string" && timeZone.length > 0
      ? timeZone
      : "UTC";
  try {
    return formatCalendarDateInTZ(new Date(), tz);
  } catch {
    return toDateKeyUTC(new Date());
  }
}

/** True if dateKey (YYYY-MM-DD) is strictly after "today" in that zone. */
export function isFutureDateKey(
  dateKey: string,
  timeZone?: string | null,
): boolean {
  return dateKey > todayCalendarKeyInTZ(timeZone);
}

/**
 * Column header: civil dateKey shown in the given zone (fallback UTC).
 */
export function formatColumnHeader(dateKey: string, timeZone?: string | null) {
  const d = parseDateKeyUTC(dateKey);
  const tz = timeZone && timeZone !== "UTC" ? timeZone : "UTC";
  const weekday = d.toLocaleDateString("en-US", {
    weekday: "short",
    timeZone: tz,
  });
  const monthDay = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: tz,
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
