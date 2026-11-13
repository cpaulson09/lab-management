import { Check, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export type OrderStatus = "Pending" | "Completed";

type Props = {
  status: OrderStatus;
  className?: string;
};

/**
 * Pending: outline pill with a clock. Completed: filled lime pill with a check.
 * Shape and icon differ, so color is not the only signal.
 */
export function StatusBadge({ status, className }: Props) {
  const completed = status === "Completed";
  const Icon = completed ? Check : Clock;

  return (
    <span
      className={cn(
        "inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        completed
          ? "border-transparent bg-secondary text-primary"
          : "border-primary bg-card text-primary",
        className,
      )}
    >
      <Icon
        aria-hidden
        className="size-3.5"
        strokeWidth={completed ? 3 : 2.25}
      />
      {status}
    </span>
  );
}
