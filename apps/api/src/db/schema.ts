import { sql } from "drizzle-orm";
import {
  integer,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const patient = sqliteTable("patient", {
  patient_id: integer("patient_id").primaryKey({ autoIncrement: true }),
  first_name: text("first_name").notNull(),
  last_name: text("last_name").notNull(),
  /** YYYY-MM-DD */
  date_of_birth: text("date_of_birth").notNull(),
  phone: text("phone"),
  email: text("email"),
  /** ISO time */
  created_at: text("created_at")
    .notNull()
    .default(sql`(strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))`),
});

export const lab_test = sqliteTable("lab_test", {
  lab_test_id: integer("lab_test_id").primaryKey({ autoIncrement: true }),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  /** Dollars. */
  price: real("price").notNull(),
  /** Business days, at least 1. */
  turnaround_days: integer("turnaround_days").notNull(),
});

export const ORDER_STATUSES = ["Pending", "Completed"] as const;

export const order = sqliteTable("order", {
  order_id: integer("order_id").primaryKey({ autoIncrement: true }),
  patient_id: integer("patient_id")
    .notNull()
    .references(() => patient.patient_id),
  status: text("status", { enum: ORDER_STATUSES }).notNull().default("Pending"),
  /** ISO time */
  placed_at: text("placed_at").notNull(),
  /** YYYY-MM-DD, set when placed. */
  ready_date: text("ready_date").notNull(),
  /** Dollars, rounded to 2 places, set when placed. */
  total: real("total").notNull(),
  /** ISO time */
  completed_at: text("completed_at"),
});

export const order_item = sqliteTable(
  "order_item",
  {
    order_item_id: integer("order_item_id").primaryKey({ autoIncrement: true }),
    order_id: integer("order_id")
      .notNull()
      .references(() => order.order_id),
    lab_test_id: integer("lab_test_id")
      .notNull()
      .references(() => lab_test.lab_test_id),
    /** Copied from the catalog when the order is placed. */
    price: real("price").notNull(),
    /** Copied from the catalog when the order is placed. */
    turnaround_days: integer("turnaround_days").notNull(),
  },
  (t) => [
    uniqueIndex("order_item_order_id_lab_test_id_unique").on(
      t.order_id,
      t.lab_test_id,
    ),
  ],
);

export const schema = { patient, lab_test, order, order_item };
