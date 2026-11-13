import type { OrderStatus } from "@lab/shared";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableLoading } from "@/components/shared/TableLoading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatMoney, formatOrderNumber } from "@/lib/format";

/** The fields the table shows from one `orders.list` row. */
export type OrderRow = {
  orderId: number;
  patientFirstName: string;
  patientLastName: string;
  testNames: string[];
  total: number;
  readyDate: string;
  status: OrderStatus;
};

type Props = {
  orders: OrderRow[] | undefined;
  loading: boolean;
  onOpen: (orderId: number) => void;
};

export function OrderTable({ orders, loading, onOpen }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Patient</TableHead>
            <TableHead className="hidden xl:table-cell">Tests</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead className="hidden sm:table-cell">Ready date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableLoading columns={6} />
          ) : (
            orders?.map((order) => (
              <TableRow
                key={order.orderId}
                className="cursor-pointer"
                onClick={() => onOpen(order.orderId)}
              >
                <TableCell>
                  {/* The button gives keyboard users the same action as the row click. */}
                  <button
                    type="button"
                    className="font-semibold text-link underline-offset-4 hover:underline focus-visible:underline"
                    onClick={(event) => {
                      event.stopPropagation();
                      onOpen(order.orderId);
                    }}
                  >
                    {formatOrderNumber(order.orderId)}
                  </button>
                </TableCell>
                <TableCell className="font-medium whitespace-normal wrap-anywhere">
                  {order.patientFirstName} {order.patientLastName}
                </TableCell>
                <TableCell
                  className="hidden max-w-64 truncate text-muted-foreground xl:table-cell"
                  title={order.testNames.join(", ")}
                >
                  {order.testNames.join(", ")}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(order.total)}
                </TableCell>
                <TableCell className="hidden whitespace-nowrap sm:table-cell">
                  {formatDate(order.readyDate)}
                </TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
