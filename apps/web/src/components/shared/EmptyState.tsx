import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export function EmptyState({ title, description, icon, action }: Props) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed bg-card px-6 py-12 text-center">
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary [&_svg]:size-6">
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1">
        <h2 className="text-lg font-bold">{title}</h2>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      {action && (
        <Button className="mt-2" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
