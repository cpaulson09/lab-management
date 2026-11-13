import type { LabTest } from "@lab/shared";
import { Pencil } from "lucide-react";
import { TableLoading } from "@/components/shared/TableLoading";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatMoney } from "@/lib/format";

type Props = {
  labTests: LabTest[] | undefined;
  loading: boolean;
  onEdit: (labTest: LabTest) => void;
};

export function LabTestTable({ labTests, loading, onEdit }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Name</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">
              <span className="sm:hidden">Days</span>
              <span className="hidden sm:inline">Turnaround</span>
            </TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableLoading columns={5} />
          ) : (
            labTests?.map((labTest) => (
              <TableRow key={labTest.labTestId}>
                <TableCell className="font-mono font-semibold">
                  {labTest.code}
                </TableCell>
                <TableCell className="whitespace-normal wrap-anywhere">
                  {labTest.name}
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatMoney(labTest.price)}
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {labTest.turnaroundDays}{" "}
                  {labTest.turnaroundDays === 1 ? "day" : "days"}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${labTest.code}`}
                    onClick={() => onEdit(labTest)}
                  >
                    <Pencil aria-hidden />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
