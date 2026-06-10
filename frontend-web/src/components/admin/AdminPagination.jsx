function AdminPagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null;

  return (
    <nav className="flex flex-col gap-3 rounded-stitch border border-line bg-white p-4 shadow-panel sm:flex-row sm:items-center sm:justify-between" aria-label="Pagination">
      <p className="text-sm font-bold text-muted">
        Page {pagination.page} sur {pagination.totalPages} / {pagination.total} element(s)
      </p>
      <div className="flex gap-2">
        <button
          className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-black text-ink disabled:opacity-50"
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
        >
          Precedent
        </button>
        <button
          className="rounded-lg bg-primary px-4 py-2 text-sm font-black text-white disabled:opacity-50"
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
        >
          Suivant
        </button>
      </div>
    </nav>
  );
}

export default AdminPagination;
