import { FlaskConical, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { useUrlPagination } from "@/components/shared/useUrlPagination";
import { Button } from "@/components/ui/button";
import { formatDate, formatMoney } from "@/lib/format";

export function Orders() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Lab orders"
        description="Every order, its total and when results are ready."
        actions={
          <Button size="lg" disabled>
            <Plus aria-hidden />
            New order
          </Button>
        }
      />
      <SharedPartsPreview />
    </div>
  );
}

// TEMP: remove in step 4. Fake values to check the shared parts by eye.
function SharedPartsPreview() {
  const { page, setPage } = useUrlPagination();

  return (
    <div className="flex flex-col gap-6 rounded-xl border bg-card p-6">
      <div className="flex flex-wrap items-center gap-3">
        <StatusBadge status="Pending" />
        <StatusBadge status="Completed" />
        <span className="text-sm">{formatMoney(84.5)}</span>
        <span className="text-sm">{formatDate("2026-11-17")}</span>
      </div>
      <Pagination page={page} pageSize={10} total={47} onPageChange={setPage} />
      <EmptyState
        icon={<FlaskConical />}
        title="No orders yet"
        description="Create the first order to see it here."
        action={{ label: "New order", onClick: () => {} }}
      />
    </div>
  );
}
