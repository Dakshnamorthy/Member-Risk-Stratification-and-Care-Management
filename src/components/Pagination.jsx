import '../styles/pages.css';

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= totalPages;

  return (
    <div className="pagination">
      <button type="button" className="pagination__button" onClick={() => onPageChange(currentPage - 1)} disabled={prevDisabled}>
        Previous
      </button>
      <span className="pagination__status">
        Page {currentPage} of {totalPages}
      </span>
      <button type="button" className="pagination__button" onClick={() => onPageChange(currentPage + 1)} disabled={nextDisabled}>
        Next
      </button>
    </div>
  );
}
