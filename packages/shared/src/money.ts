/** Rounds a dollar amount to 2 decimal places. All money goes through this. */
export function roundMoney(amount: number): number {
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}
