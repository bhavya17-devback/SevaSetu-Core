import React, { useEffect, useState } from "react";
import "./Pagination.css";

/* =========================================================
   PAGINATION
   Long tables show one page at a time, so an NGO with a
   thousand donations never has to scroll through all of them.

   usePaged(items, pageSize, resetKey) -> slice for this page.
   Pass something that changes with the filters as resetKey so
   the table jumps back to page 1 when the filters change.
   ========================================================= */

export function usePaged(items, pageSize = 10, resetKey = "") {
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [resetKey]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * pageSize;

  return {
    pageItems: items.slice(start, start + pageSize),
    page: current,
    setPage,
    totalPages,
    total: items.length,
    pageSize,
  };
}

export function Pagination({ paged }) {
  const { page, setPage, totalPages, total, pageSize } = paged;

  if (total <= pageSize) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="sv-pagination">
      <span>
        Showing {from}–{to} of {total}
      </span>

      <div className="sv-pagination-controls">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
        >
          ← Prev
        </button>
        <strong>
          Page {page} of {totalPages}
        </strong>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
