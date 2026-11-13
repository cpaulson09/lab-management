import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

/** One page of the lab test catalog, sorted by code. */
export function useLabTestList(params: { page: number }) {
  const trpc = useTRPC();
  return useQuery(
    trpc.labTests.list.queryOptions(
      { page: params.page },
      { placeholderData: keepPreviousData },
    ),
  );
}

/** Refreshes lab tests, and orders too (order items show the test name). */
function useInvalidateLabTests() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: trpc.labTests.pathKey() }),
      queryClient.invalidateQueries({ queryKey: trpc.orders.pathKey() }),
    ]);
}

export function useCreateLabTest() {
  const trpc = useTRPC();
  const invalidate = useInvalidateLabTests();
  return useMutation(
    trpc.labTests.create.mutationOptions({ onSuccess: invalidate }),
  );
}

export function useUpdateLabTest() {
  const trpc = useTRPC();
  const invalidate = useInvalidateLabTests();
  return useMutation(
    trpc.labTests.update.mutationOptions({ onSuccess: invalidate }),
  );
}
