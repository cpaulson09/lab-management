import { MAX_PAGE_SIZE, type OrderStatus } from "@lab/shared";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

/** One page of orders, newest first, with the URL filters. */
export function useOrderList(params: {
  page: number;
  patientId?: number;
  status?: OrderStatus;
}) {
  const trpc = useTRPC();
  return useQuery(
    trpc.orders.list.queryOptions(params, {
      placeholderData: keepPreviousData,
    }),
  );
}

/** One order with its items. Does nothing while `orderId` is undefined. */
export function useOrder(orderId: number | undefined) {
  const trpc = useTRPC();
  return useQuery({
    ...trpc.orders.get.queryOptions({ orderId: orderId ?? 0 }),
    enabled: orderId !== undefined,
  });
}

/**
 * Patients for the filter and the new order picker.
 * Loads the first 100 (the API maximum), sorted by last name.
 */
export function usePatientOptions() {
  const trpc = useTRPC();
  return useQuery(
    trpc.patients.list.queryOptions({ page: 1, pageSize: MAX_PAGE_SIZE }),
  );
}

/** Lab tests for the test picker. Loads the first 100, sorted by code. */
export function useLabTestOptions() {
  const trpc = useTRPC();
  return useQuery(
    trpc.labTests.list.queryOptions({ page: 1, pageSize: MAX_PAGE_SIZE }),
  );
}

function useInvalidateOrders() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: trpc.orders.pathKey() });
}

export function useCreateOrder() {
  const trpc = useTRPC();
  const invalidate = useInvalidateOrders();
  return useMutation(
    trpc.orders.create.mutationOptions({ onSuccess: invalidate }),
  );
}

export function useCompleteOrder() {
  const trpc = useTRPC();
  const invalidate = useInvalidateOrders();
  return useMutation(
    // Also refresh on error: "already completed" means our copy is stale.
    trpc.orders.complete.mutationOptions({ onSettled: invalidate }),
  );
}
