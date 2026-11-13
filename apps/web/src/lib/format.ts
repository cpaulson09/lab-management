const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const shortDate = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
  month: "short",
  day: "numeric",
});

/** 84.5 → "$84.50" */
export function formatMoney(amount: number): string {
  return money.format(amount);
}

/**
 * "2026-11-17" → "Tue, Nov 17".
 * Reads the date as a local calendar day, so the time zone cannot move it.
 */
export function formatDate(isoDate: string): string {
  const [year = 0, month = 1, day = 1] = isoDate
    .slice(0, 10)
    .split("-")
    .map(Number);
  return shortDate.format(new Date(year, month - 1, day));
}
