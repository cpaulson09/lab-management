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

const fullDate = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** "1984-03-09" → "Mar 9, 1984". Read as a local calendar day, like `formatDate`. */
export function formatFullDate(isoDate: string): string {
  const [year = 0, month = 1, day = 1] = isoDate
    .slice(0, 10)
    .split("-")
    .map(Number);
  return fullDate.format(new Date(year, month - 1, day));
}

/** An ISO time → "Nov 12, 2026, 3:04 PM" in the viewer's time zone. */
export function formatDateTime(isoTime: string): string {
  return new Date(isoTime).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** 1048 → "#1048" */
export function formatOrderNumber(orderId: number): string {
  return `#${orderId}`;
}
