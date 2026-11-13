const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Reads a `Date`, ISO time or `YYYY-MM-DD` string as a UTC calendar day (midnight UTC). */
function toUtcDay(date: Date | string): Date {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid date: ${String(date)}`);
  }
  return new Date(
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()),
  );
}

function isWeekend(d: Date): boolean {
  const day = d.getUTCDay();
  return day === 0 || day === 6;
}

/** Formats a UTC date as `YYYY-MM-DD`. */
export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Adds `n` business days to `date` (UTC). Counting starts on the next business
 * day, Saturday and Sunday are skipped, and there are no holidays.
 * `n = 0` returns the same day. Returns `YYYY-MM-DD`.
 */
export function addBusinessDays(date: Date | string, n: number): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new Error(
      `Business days must be a whole number of 0 or more, got ${n}`,
    );
  }
  let current = toUtcDay(date);
  let left = n;
  while (left > 0) {
    current = new Date(current.getTime() + MS_PER_DAY);
    if (!isWeekend(current)) {
      left -= 1;
    }
  }
  return toIsoDate(current);
}
