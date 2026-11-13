import { roundMoney } from "../money";

/** Sum of the item prices, rounded to 2 places. An order needs at least 1 item. */
export function orderTotal(items: ReadonlyArray<{ price: number }>): number {
  if (items.length === 0) {
    throw new Error("An order needs at least one item");
  }
  return roundMoney(items.reduce((sum, item) => sum + item.price, 0));
}
