import type { Db } from "../db/client";

/** The only code that reads and writes the order and order_item tables. Step 3 fills this in. */
export class OrderRepository {
  constructor(readonly db: Db) {}
}
