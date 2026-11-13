import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

/** One page of patients, filtered by name. */
export function usePatientList(params: { page: number; search: string }) {
  const trpc = useTRPC();
  return useQuery(
    trpc.patients.list.queryOptions(
      { page: params.page, search: params.search || undefined },
      { placeholderData: keepPreviousData },
    ),
  );
}

/** Refreshes patients, and orders too (they show the patient's name). */
function useInvalidatePatients() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.patients.pathKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.orders.pathKey() }),
    ]);
}

export function useCreatePatient() {
  const trpc = useTRPC();
  const invalidate = useInvalidatePatients();
  return useMutation(
    trpc.patients.create.mutationOptions({ onSuccess: invalidate }),
  );
}

export function useUpdatePatient() {
  const trpc = useTRPC();
  const invalidate = useInvalidatePatients();
  return useMutation(
    trpc.patients.update.mutationOptions({ onSuccess: invalidate }),
  );
}
