export const buildPaginationMeta = (total, page, limit) => {
  const currentPage = parseInt(page, 10) || 1;
  const currentLimit = parseInt(limit, 10) || 10;
  const totalPages = Math.ceil(total / currentLimit);

  return {
    total,
    page: currentPage,
    limit: currentLimit,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1
  };
};
