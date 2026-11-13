import type { Order, OrderItem, OrderStatus } from "@lab/shared";
import { and, asc, count, desc, eq, inArray, type SQL } from "drizzle-orm";
import type { Db } from "../db/client";
import { type Page, type PageParams, paginate } from "../db/paginate";
import { lab_test, order, order_item, patient } from "../db/schema";

type OrderRow = typeof order.$inferSelect;
type OrderItemRow = typeof order_item.$inferSelect;

/** One test in an order, with the catalog code and name for display. */
export type OrderDetailItem = OrderItem & { code: string; name: string };

/** An order with its items and the patient's name. Result of `get`. */
export type OrderDetail = Order & {
  patientFirstName: string;
  patientLastName: string;
  items: OrderDetailItem[];
};

/** One row of the orders table. Result items of `list`. */
export type OrderListRow = Order & {
  patientFirstName: string;
  patientLastName: string;
  /** Test names in the order they were added. */
  testNames: string[];
};

export type OrderListParams = PageParams & {
  patientId?: number;
  status?: OrderStatus;
};

/** What `create` saves. The service fills in every value. */
export type NewOrder = {
  patientId: number;
  status: OrderStatus;
  placedAt: string;
  readyDate: string;
  total: number;
  items: Array<Pick<OrderItem, "labTestId" | "price" | "turnaroundDays">>;
};

function toOrder(row: OrderRow): Order {
  return {
    orderId: row.order_id,
    patientId: row.patient_id,
    status: row.status,
    placedAt: row.placed_at,
    readyDate: row.ready_date,
    total: row.total,
    completedAt: row.completed_at,
  };
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    orderItemId: row.order_item_id,
    orderId: row.order_id,
    labTestId: row.lab_test_id,
    price: row.price,
    turnaroundDays: row.turnaround_days,
  };
}

function listFilter(params: OrderListParams): SQL | undefined {
  return and(
    params.patientId === undefined
      ? undefined
      : eq(order.patient_id, params.patientId),
    params.status === undefined ? undefined : eq(order.status, params.status),
  );
}

/** The only code that reads and writes the order and order_item tables. */
export class OrderRepository {
  constructor(readonly db: Db) {}

  /** Saves the order row and its item rows in one transaction. */
  async create(input: NewOrder): Promise<OrderDetail> {
    const orderId = this.db.transaction((tx) => {
      const row = tx
        .insert(order)
        .values({
          patient_id: input.patientId,
          status: input.status,
          placed_at: input.placedAt,
          ready_date: input.readyDate,
          total: input.total,
        })
        .returning({ orderId: order.order_id })
        .get();
      tx.insert(order_item)
        .values(
          input.items.map((item) => ({
            order_id: row.orderId,
            lab_test_id: item.labTestId,
            price: item.price,
            turnaround_days: item.turnaroundDays,
          })),
        )
        .run();
      return row.orderId;
    });
    const created = await this.findById(orderId);
    if (!created) throw new Error(`Order ${orderId} missing after insert`);
    return created;
  }

  async findById(id: number): Promise<OrderDetail | null> {
    const [row] = await this.db
      .select({
        order,
        firstName: patient.first_name,
        lastName: patient.last_name,
      })
      .from(order)
      .innerJoin(patient, eq(patient.patient_id, order.patient_id))
      .where(eq(order.order_id, id))
      .limit(1);
    if (!row) return null;
    const items = await this.db
      .select({ item: order_item, code: lab_test.code, name: lab_test.name })
      .from(order_item)
      .innerJoin(lab_test, eq(lab_test.lab_test_id, order_item.lab_test_id))
      .where(eq(order_item.order_id, id))
      .orderBy(asc(order_item.order_item_id));
    return {
      ...toOrder(row.order),
      patientFirstName: row.firstName,
      patientLastName: row.lastName,
      items: items.map((r) => ({
        ...toOrderItem(r.item),
        code: r.code,
        name: r.name,
      })),
    };
  }

  /** One page of orders, newest first. */
  async list(params: OrderListParams): Promise<Page<OrderListRow>> {
    const where = listFilter(params);
    return paginate(params, {
      items: async (limit, offset) => {
        const rows = await this.db
          .select({
            order,
            firstName: patient.first_name,
            lastName: patient.last_name,
          })
          .from(order)
          .innerJoin(patient, eq(patient.patient_id, order.patient_id))
          .where(where)
          .orderBy(desc(order.placed_at), desc(order.order_id))
          .limit(limit)
          .offset(offset);
        const names = await this.testNamesByOrder(
          rows.map((r) => r.order.order_id),
        );
        return rows.map((r) => ({
          ...toOrder(r.order),
          patientFirstName: r.firstName,
          patientLastName: r.lastName,
          testNames: names.get(r.order.order_id) ?? [],
        }));
      },
      count: async () => {
        const [row] = await this.db
          .select({ total: count() })
          .from(order)
          .where(where);
        return row?.total ?? 0;
      },
    });
  }

  /**
   * Sets status Completed and the time. Only a Pending order changes.
   * Returns false when no Pending order has this id.
   */
  async markCompleted(id: number, completedAt: string): Promise<boolean> {
    const rows = await this.db
      .update(order)
      .set({ status: "Completed", completed_at: completedAt })
      .where(and(eq(order.order_id, id), eq(order.status, "Pending")))
      .returning({ orderId: order.order_id });
    return rows.length > 0;
  }

  private async testNamesByOrder(
    orderIds: number[],
  ): Promise<Map<number, string[]>> {
    const names = new Map<number, string[]>();
    if (orderIds.length === 0) return names;
    const rows = await this.db
      .select({ orderId: order_item.order_id, name: lab_test.name })
      .from(order_item)
      .innerJoin(lab_test, eq(lab_test.lab_test_id, order_item.lab_test_id))
      .where(inArray(order_item.order_id, orderIds))
      .orderBy(asc(order_item.order_item_id));
    for (const row of rows) {
      const list = names.get(row.orderId) ?? [];
      list.push(row.name);
      names.set(row.orderId, list);
    }
    return names;
  }
}
