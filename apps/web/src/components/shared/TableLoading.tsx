import { TableCell, TableRow } from "@/components/ui/table";

type Props = {
  columns: number;
  rows?: number;
};

/** Grey placeholder rows while a table loads. */
export function TableLoading({ columns, rows = 5 }: Props) {
  return (
    <>
      {Array.from({ length: rows }, (_, row) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows never move
        <TableRow key={row} aria-hidden>
          {Array.from({ length: columns }, (_, col) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: placeholder cells never move
            <TableCell key={col}>
              <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
