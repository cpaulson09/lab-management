import { useCallback } from "react";
import { useSearchParams } from "react-router";

/** Reads and writes `?page=` in the URL. Page 1 is the default and is not written. */
export function useUrlPagination() {
  const [searchParams, setSearchParams] = useSearchParams();

  const raw = Number(searchParams.get("page"));
  const page = Number.isInteger(raw) && raw >= 1 ? raw : 1;

  const setPage = useCallback(
    (next: number) => {
      setSearchParams((params) => {
        const updated = new URLSearchParams(params);
        if (next <= 1) updated.delete("page");
        else updated.set("page", String(next));
        return updated;
      });
    },
    [setSearchParams],
  );

  return { page, setPage };
}
