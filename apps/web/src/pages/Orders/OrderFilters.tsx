import { ORDER_STATUSES, type OrderStatus } from "@lab/shared";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderFilters } from "./useOrderFilters";
import { usePatientOptions } from "./useOrders";

const ALL = "all";

export function OrderFilters() {
  const { patientId, status, setFilters, clearFilters, hasFilters } =
    useOrderFilters();
  const patients = usePatientOptions();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Select
        value={patientId === undefined ? ALL : String(patientId)}
        onValueChange={(value) =>
          setFilters({ patientId: value === ALL ? undefined : Number(value) })
        }
      >
        <SelectTrigger
          aria-label="Filter by patient"
          className="h-10 w-full bg-card sm:w-64"
        >
          <SelectValue placeholder="All patients" />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={ALL}>All patients</SelectItem>
          {patients.data?.items.map((patient) => (
            <SelectItem
              key={patient.patientId}
              value={String(patient.patientId)}
            >
              {patient.lastName}, {patient.firstName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={status ?? ALL}
        onValueChange={(value) =>
          setFilters({
            status: value === ALL ? undefined : (value as OrderStatus),
          })
        }
      >
        <SelectTrigger
          aria-label="Filter by status"
          className="h-10 w-full bg-card sm:w-44"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent position="popper">
          <SelectItem value={ALL}>All statuses</SelectItem>
          {ORDER_STATUSES.map((value) => (
            <SelectItem key={value} value={value}>
              {value}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={clearFilters}
          className="self-start sm:self-auto"
        >
          <X aria-hidden />
          Clear filters
        </Button>
      )}
    </div>
  );
}
