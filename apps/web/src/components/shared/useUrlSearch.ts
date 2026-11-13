import { useCallback } from "react";
import { useSearchParams } from "react-router";

/** Reads and writes `?q=` in the URL. A new search goes back to page 1. */
export function useUrlSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("q") ?? "";

  const setSearch = useCallback(
    (next: string) => {
      setSearchParams(
        (params) => {
          const updated = new URLSearchParams(params);
          const text = next.trim();
          if (text) updated.set("q", text);
          else updated.delete("q");
          updated.delete("page");
          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { search, setSearch };
}
