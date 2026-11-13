import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/lib/trpc";

/** Small proof that the web app can reach the API. */
export function ApiStatus() {
  const trpc = useTRPC();
  const health = useQuery(trpc.health.queryOptions());

  const label = health.isPending
    ? "Checking API…"
    : health.data?.status === "ok"
      ? "API ok"
      : "API down";

  return (
    <p className="text-xs text-white/70" aria-live="polite">
      {label}
    </p>
  );
}
