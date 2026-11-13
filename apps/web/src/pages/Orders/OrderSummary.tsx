import { estimateReadyDate, type LabTest, orderTotal } from "@lab/shared";
import { formatDate, formatMoney } from "@/lib/format";

type Props = {
  /** The tests ticked so far. */
  tests: LabTest[];
};

/**
 * Live total and ready date for a new order. Uses the same shared rules as the
 * API, so the numbers match what the server saves (if placed today).
 */
export function OrderSummary({ tests }: Props) {
  const empty = tests.length === 0;
  const total = empty ? null : orderTotal(tests);
  const readyDate = empty ? null : estimateReadyDate(new Date(), tests);

  return (
    <dl
      aria-live="polite"
      className="grid grid-cols-3 gap-3 rounded-lg bg-secondary px-4 py-3 text-primary"
    >
      <div>
        <dt className="text-xs font-medium">Tests</dt>
        <dd className="text-lg font-bold tabular-nums">{tests.length}</dd>
      </div>
      <div>
        <dt className="text-xs font-medium">Total</dt>
        <dd className="text-lg font-bold tabular-nums">
          {total === null ? "—" : formatMoney(total)}
        </dd>
      </div>
      <div>
        <dt className="text-xs font-medium">Ready</dt>
        <dd className="text-lg font-bold whitespace-nowrap">
          {readyDate === null ? "—" : formatDate(readyDate)}
        </dd>
      </div>
    </dl>
  );
}
