import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ pagination, onPageChange }) => {
  if (!pagination || pagination.totalPages <= 1) return null;

  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  return (
    <div className="flex items-center justify-center gap-4 mt-8">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={!hasPrevPage}
        className="btn btn-outline btn-sm rounded-xl font-bold gap-1"
        aria-label="Previous Page"
      >
        <ChevronLeft size={16} /> Prev
      </button>

      <span className="text-xs font-semibold text-base-content/60">
        Page <span className="text-base-content font-bold">{page}</span> of <span className="text-base-content font-bold">{totalPages}</span>
      </span>

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={!hasNextPage}
        className="btn btn-outline btn-sm rounded-xl font-bold gap-1"
        aria-label="Next Page"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
};

export default Pagination;
