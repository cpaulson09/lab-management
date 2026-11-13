import { CheckCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { apiErrorMessage } from "@/lib/api-error";
import {
  formatDate,
  formatDateTime,
  formatMoney,
  formatOrderNumber,
} from "@/lib/format";
import { useCompleteOrder, useOrder } from "./useOrders";

type Props = {
  /** The order to show (from `?open=`). Undefined closes the panel. */
  orderId: number | undefined;
  onClose: () => void;
};

/** Side panel with one order's items, total, dates and status. */
export function OrderDetail({ orderId, onClose }: Props) {
  // Keep the last order while the panel slides out, so it does not go blank.
  const [shownId, setShownId] = useState(orderId);
  if (orderId !== undefined && orderId !== shownId) setShownId(orderId);

  const order = useOrder(shownId);
  const complete = useCompleteOrder();

  async function markCompleted() {
    if (shownId === undefined) return;
    try {
      await complete.mutateAsync({ orderId: shownId });
      toast.success(`Order ${formatOrderNumber(shownId)} completed`);
    } catch (error) {
      toast.error(apiErrorMessage(error));
    }
  }

  return (
    <Sheet
      open={orderId !== undefined}
      onOpenChange={(open) => !open && onClose()}
    >
      <SheetContent>
        <SheetHeader>
          <SheetTitle>
            Order {shownId === undefined ? "" : formatOrderNumber(shownId)}
          </SheetTitle>
          <SheetDescription>
            {order.data
              ? `${order.data.patientFirstName} ${order.data.patientLastName}`
              : order.isError
                ? "Could not load this order."
                : "Loading…"}
          </SheetDescription>
        </SheetHeader>

        {order.isError && (
          <p className="px-6 text-sm text-muted-foreground">
            {apiErrorMessage(order.error)}
          </p>
        )}

        {order.data && (
          <div className="flex flex-col gap-6 px-6">
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <StatusBadge status={order.data.status} />
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Ready date</dt>
                <dd className="font-semibold">
                  {formatDate(order.data.readyDate)}
                </dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="text-muted-foreground">Placed</dt>
                <dd>{formatDateTime(order.data.placedAt)}</dd>
              </div>
              {order.data.completedAt && (
                <div className="flex flex-col gap-1">
                  <dt className="text-muted-foreground">Completed</dt>
                  <dd>{formatDateTime(order.data.completedAt)}</dd>
                </div>
              )}
            </dl>

            <section className="flex flex-col gap-2">
              <h3 className="text-sm font-bold">Tests</h3>
              <ul className="rounded-lg border bg-card">
                {order.data.items.map((item) => (
                  <li
                    key={item.orderItemId}
                    className="flex items-center gap-3 border-b px-3 py-2.5 text-sm last:border-b-0"
                  >
                    <span className="w-14 shrink-0 font-mono font-semibold">
                      {item.code}
                    </span>
                    <span className="min-w-0 flex-1">{item.name}</span>
                    <span className="tabular-nums">
                      {formatMoney(item.price)}
                    </span>
                  </li>
                ))}
                <li className="flex items-center justify-between rounded-b-lg bg-muted px-3 py-2.5 font-bold">
                  <span>Total</span>
                  <span className="tabular-nums">
                    {formatMoney(order.data.total)}
                  </span>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground">
                Prices are copied from the catalog when the order is placed.
              </p>
            </section>
          </div>
        )}

        {order.data?.status === "Pending" && (
          <SheetFooter>
            <Button
              size="lg"
              onClick={markCompleted}
              disabled={complete.isPending}
            >
              <CheckCheck aria-hidden />
              {complete.isPending ? "Saving…" : "Mark completed"}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
