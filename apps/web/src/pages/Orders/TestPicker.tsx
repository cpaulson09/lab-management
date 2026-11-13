import type { LabTest } from "@lab/shared";
import { Check } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { formatMoney } from "@/lib/format";
import { cn } from "@/lib/utils";

type Props = {
  labTests: LabTest[];
  selectedIds: number[];
  onChange: (ids: number[]) => void;
  invalid?: boolean;
};

/** A filterable list of lab tests with a checkbox on each. */
export function TestPicker({
  labTests,
  selectedIds,
  onChange,
  invalid,
}: Props) {
  const [filter, setFilter] = useState("");
  const text = filter.trim().toLowerCase();
  const shown = text
    ? labTests.filter(
        (test) =>
          test.code.toLowerCase().includes(text) ||
          test.name.toLowerCase().includes(text),
      )
    : labTests;

  function toggle(labTestId: number) {
    onChange(
      selectedIds.includes(labTestId)
        ? selectedIds.filter((id) => id !== labTestId)
        : [...selectedIds, labTestId],
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="search"
        aria-label="Filter tests by code or name"
        placeholder="Filter by code or name"
        className="bg-card"
        value={filter}
        onChange={(event) => setFilter(event.target.value)}
      />
      <ul
        aria-invalid={invalid}
        className={cn(
          "flex max-h-64 flex-col overflow-y-auto rounded-lg border bg-card",
          invalid && "border-destructive",
        )}
      >
        {shown.length === 0 && (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            {labTests.length === 0
              ? "No lab tests yet. Add one in the Test catalog first."
              : `No tests match "${filter}".`}
          </li>
        )}
        {shown.map((test) => {
          const checked = selectedIds.includes(test.labTestId);
          return (
            <li key={test.labTestId} className="border-b last:border-b-0">
              <label
                className={cn(
                  "flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-muted",
                  checked && "bg-secondary/50 hover:bg-secondary/70",
                )}
              >
                <input
                  type="checkbox"
                  className="peer sr-only"
                  aria-label={`${test.code} ${test.name}`}
                  checked={checked}
                  onChange={() => toggle(test.labTestId)}
                />
                <span
                  aria-hidden
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded border border-input bg-card peer-focus-visible:ring-[3px] peer-focus-visible:ring-ring/50",
                    checked &&
                      "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {checked && <Check className="size-3.5" strokeWidth={3} />}
                </span>
                <span className="max-w-[40%] min-w-14 shrink-0 font-mono font-semibold break-all">
                  {test.code}
                </span>
                <span className="min-w-0 flex-1 wrap-anywhere">
                  {test.name}
                </span>
                <span className="shrink-0 text-right tabular-nums">
                  {formatMoney(test.price)}
                  <span className="block text-xs text-muted-foreground">
                    {test.turnaroundDays}{" "}
                    {test.turnaroundDays === 1 ? "day" : "days"}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
