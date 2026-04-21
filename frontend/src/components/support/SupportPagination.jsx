const SupportPagination = ({ supportPage, pagination, supportLoading, onPageChange }) => (
  <div className="pagination-row">
    <button
      className="ghost-btn"
      type="button"
      onClick={() => onPageChange(Math.max(1, supportPage - 1))}
      disabled={supportPage <= 1 || supportLoading}
    >
      Previous
    </button>
    <span>
      Page {supportPage} of {pagination.totalPages || 1}
    </span>
    <button
      className="ghost-btn"
      type="button"
      onClick={() => onPageChange(Math.min(pagination.totalPages || 1, supportPage + 1))}
      disabled={supportPage >= (pagination.totalPages || 1) || supportLoading}
    >
      Next
    </button>
  </div>
);

export default SupportPagination;
