import { ClipboardList, Plus } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Pagination } from "@/components/shared/Pagination";
import { useUrlPagination } from "@/components/shared/useUrlPagination";
import { Button } from "@/components/ui/button";
import { NewOrder } from "./NewOrder";
import { OrderDetail } from "./OrderDetail";
import { OrderFilters } from "./OrderFilters";
import { OrderTable } from "./OrderTable";
import { useOrderFilters } from "./useOrderFilters";
import { useOrderList } from "./useOrders";

export function Orders() {
  const { page, setPage } = useUrlPagination();
  const {
    patientId,
    status,
    hasFilters,
    clearFilters,
    openOrderId,
    setOpenOrderId,
  } = useOrderFilters();
  const list = useOrderList({ page, patientId, status });
  const [newOrderOpen, setNewOrderOpen] = useState(false);

  const newOrder = () => setNewOrderOpen(true);
  const empty = list.isSuccess && list.data.total === 0;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Lab orders"
        description="Every order, its total and when results are ready."
        actions={
          <Button size="lg" onClick={newOrder}>
            <Plus aria-hidden />
            New order
          </Button>
        }
      />

      <OrderFilters />

      {list.isError ? (
        <EmptyState
          title="Could not load orders"
          description="Check that the API is running, then try again."
          action={{ label: "Try again", onClick: () => list.refetch() }}
        />
      ) : empty ? (
        hasFilters ? (
          <EmptyState
            icon={<ClipboardList />}
            title="No orders match"
            description="No order has this patient and status."
            action={{ label: "Clear filters", onClick: clearFilters }}
          />
        ) : (
          <EmptyState
            icon={<ClipboardList />}
            title="No orders yet"
            description="Place the first order to see it here."
            action={{ label: "New order", onClick: newOrder }}
          />
        )
      ) : (
        <>
          <OrderTable
            orders={list.data?.items}
            loading={list.isPending}
            onOpen={setOpenOrderId}
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

      <NewOrder
        open={newOrderOpen}
        onOpenChange={setNewOrderOpen}
        defaultPatientId={patientId}
        onCreated={(orderId) => {
          setNewOrderOpen(false);
          setOpenOrderId(orderId);
        }}
      />
      <OrderDetail
        orderId={openOrderId}
        onClose={() => setOpenOrderId(undefined)}
      />
    </div>
  );
}
