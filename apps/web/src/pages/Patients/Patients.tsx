import type { Patient } from "@lab/shared";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { SearchInput } from "@/components/shared/SearchInput";
import { useUrlPagination } from "@/components/shared/useUrlPagination";
import { useUrlSearch } from "@/components/shared/useUrlSearch";
import { Button } from "@/components/ui/button";
import { PatientForm } from "./PatientForm";
import { PatientTable } from "./PatientTable";
import { usePatientList } from "./usePatients";

/** The dialog. `patient` stays set while it closes, so the title does not flip. */
type FormState = { open: boolean; patient?: Patient };

export function Patients() {
  const { page, setPage } = useUrlPagination();
  const { search, setSearch } = useUrlSearch();
  const list = usePatientList({ page, search });
  const [form, setForm] = useState<FormState>({ open: false });

  const addPatient = () => setForm({ open: true });
  const empty = list.isSuccess && list.data.total === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Patients"
        description="Find, add and edit patients."
        actions={
          <Button size="lg" onClick={addPatient}>
            <Plus aria-hidden />
            Add patient
          </Button>
        }
      />

      <SearchInput
        label="Search patients by name"
        placeholder="Search by name"
        value={search}
        onChange={setSearch}
      />

      {list.isError ? (
        <EmptyState
          title="Could not load patients"
          description="Check that the API is running, then try again."
          action={{ label: "Try again", onClick: () => list.refetch() }}
        />
      ) : empty ? (
        search ? (
          <EmptyState
            icon={<User />}
            title="No patients match"
            description={`Nobody is named like "${search}".`}
            action={{ label: "Clear search", onClick: () => setSearch("") }}
          />
        ) : (
          <EmptyState
            icon={<User />}
            title="No patients yet"
            description="Add the first patient to start placing orders."
            action={{ label: "Add patient", onClick: addPatient }}
          />
        )
      ) : (
        <>
          <PatientTable
            patients={list.data?.items}
            loading={list.isPending}
            onEdit={(patient) => setForm({ open: true, patient })}
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

      <PatientForm
        open={form.open}
        onOpenChange={(open) => setForm((prev) => ({ ...prev, open }))}
        patient={form.patient}
      />
    </div>
  );
}
