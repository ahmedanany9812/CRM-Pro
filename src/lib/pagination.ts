export function buildPagination(total: number, page: number, pageSize: number) {
  return {
    total,
    page,
    pageSize,
    pages: Math.ceil(total / pageSize),
  };
}
