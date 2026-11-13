import { addBusinessDays } from "./business-days";

/** Ready date = placed date + the longest turnaround among the items, in business days. */
export function estimateReadyDate(
  placedAt: Date | string,
  items: ReadonlyArray<{ turnaroundDays: number }>,
): string {
  if (items.length === 0) {
    throw new Error("An order needs at least one item");
  }
  const longest = Math.max(...items.map((item) => item.turnaroundDays));
  return addBusinessDays(placedAt, longest);
}
