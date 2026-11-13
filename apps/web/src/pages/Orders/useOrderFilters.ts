import { ORDER_STATUSES, type OrderStatus } from "@lab/shared";
import { useCallback } from "react";
import { useSearchParams } from "react-router";

function positiveInt(raw: string | null): number | undefined {
  const value = Number(raw);
  return raw && Number.isInteger(value) && value >= 1 ? value : undefined;
}

function orderStatus(raw: string | null): OrderStatus | undefined {
  return ORDER_STATUSES.find((status) => status === raw);
}

/**
 * The Orders page's URL state:
 * - `?patientId=` and `?status=` filter the list (a change goes back to page 1).
 * - `?open=` is the order shown in the detail panel.
 */
export function useOrderFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const patientId = positiveInt(searchParams.get("patientId"));
  const status = orderStatus(searchParams.get("status"));
  const openOrderId = positiveInt(searchParams.get("open"));

  const setFilters = useCallback(
    (next: { patientId?: number; status?: OrderStatus }) => {
      setSearchParams((params) => {
        const updated = new URLSearchParams(params);
        for (const [key, value] of Object.entries(next)) {
          if (value === undefined) updated.delete(key);
          else updated.set(key, String(value));
        }
        updated.delete("page");
        return updated;
      });
    },
    [setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams((params) => {
      const updated = new URLSearchParams(params);
      updated.delete("patientId");
      updated.delete("status");
      updated.delete("page");
      return updated;
    });
  }, [setSearchParams]);

  const setOpenOrderId = useCallback(
    (orderId: number | undefined) => {
      setSearchParams((params) => {
        const updated = new URLSearchParams(params);
        if (orderId === undefined) updated.delete("open");
        else updated.set("open", String(orderId));
        return updated;
      });
    },
    [setSearchParams],
  );

  return {
    patientId,
    status,
    setFilters,
    clearFilters,
    hasFilters: patientId !== undefined || status !== undefined,
    openOrderId,
    setOpenOrderId,
  };
}
