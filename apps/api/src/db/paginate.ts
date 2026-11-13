export const DEFAULT_PAGE_SIZE = 20;

export type PageParams = {
  /** 1-based page number. */
  page?: number;
  pageSize?: number;
};

export type Page<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
};

/**
 * The two halves of a paged list query. Drizzle queries can be returned
 * directly: they are awaitable.
 */
export type PageQuery<T> = {
  /** Rows for one page. */
  items: (limit: number, offset: number) => PromiseLike<T[]> | T[];
  /** Number of rows across all pages. */
  count: () => PromiseLike<number> | number;
};

/** Runs a list query for one page and returns that page plus the total. */
export async function paginate<T>(
  params: PageParams,
  query: PageQuery<T>,
): Promise<Page<T>> {
  const page = Math.max(1, Math.floor(params.page ?? 1));
  const pageSize = Math.max(
    1,
    Math.floor(params.pageSize ?? DEFAULT_PAGE_SIZE),
  );
  const [items, total] = await Promise.all([
    query.items(pageSize, (page - 1) * pageSize),
    query.count(),
  ]);
  return { items, total, page, pageSize };
}
