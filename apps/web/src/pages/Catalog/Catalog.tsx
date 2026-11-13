import type { LabTest } from "@lab/shared";
import { FlaskConical, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { useUrlPagination } from "@/components/shared/useUrlPagination";
import { Button } from "@/components/ui/button";
import { LabTestForm } from "./LabTestForm";
import { LabTestTable } from "./LabTestTable";
import { useLabTestList } from "./useLabTests";

/** The dialog. `labTest` stays set while it closes, so the title does not flip. */
type FormState = { open: boolean; labTest?: LabTest };

export function Catalog() {
  const { page, setPage } = useUrlPagination();
  const list = useLabTestList({ page });
  const [form, setForm] = useState<FormState>({ open: false });

  const addLabTest = () => setForm({ open: true });
  const empty = list.isSuccess && list.data.total === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Test catalog"
        description="Every lab test, its price and turnaround."
        actions={
          <Button size="lg" onClick={addLabTest}>
            <Plus aria-hidden />
            Add lab test
          </Button>
        }
      />

      {list.isError ? (
        <EmptyState
          title="Could not load the catalog"
          description="Check that the API is running, then try again."
          action={{ label: "Try again", onClick: () => list.refetch() }}
        />
      ) : empty ? (
        <EmptyState
          icon={<FlaskConical />}
          title="No lab tests yet"
          description="Add a lab test so it can be ordered."
          action={{ label: "Add lab test", onClick: addLabTest }}
        />
      ) : (
        <>
          <LabTestTable
            labTests={list.data?.items}
            loading={list.isPending}
            onEdit={(labTest) => setForm({ open: true, labTest })}
          />
          {list.data && (
            <Pagination
              page={page}
              pageSize={list.data.pageSize}
              total={list.data.total}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      <LabTestForm
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        labTest={form.labTest}
      />
    </div>
  );
}
