import type { Patient } from "@lab/shared";
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
import { formatFullDate } from "@/lib/format";

type Props = {
  patients: Patient[] | undefined;
  loading: boolean;
  onEdit: (patient: Patient) => void;
};

export function PatientTable({ patients, loading, onEdit }: Props) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date of birth</TableHead>
            <TableHead className="hidden md:table-cell">Phone</TableHead>
            <TableHead className="hidden lg:table-cell">Email</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">Actions</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableLoading columns={5} />
          ) : (
            patients?.map((patient) => (
              <TableRow key={patient.patientId}>
                <TableCell className="font-semibold whitespace-normal wrap-anywhere">
                  {patient.lastName}, {patient.firstName}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {formatFullDate(patient.dateOfBirth)}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {patient.phone ?? <Dash />}
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  {patient.email ?? <Dash />}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label={`Edit ${patient.firstName} ${patient.lastName}`}
                    onClick={() => onEdit(patient)}
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

function Dash() {
  return <span className="text-muted-foreground">—</span>;
}
