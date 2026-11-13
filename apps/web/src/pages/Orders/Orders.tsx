import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";

export function Orders() {
  return (
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
  );
}
