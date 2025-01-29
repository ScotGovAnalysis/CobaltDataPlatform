const Pagination = ({ currentPage, setCurrentPage, filteredData, rowsPerPage }) => (
    <nav className="ds_pagination" aria-label="Search result pages">
      <ul className="ds_pagination__list">
        <li className="ds_pagination__item">
          <button
            aria-label="Previous page"
            className="ds_pagination__link ds_pagination__link--text ds_pagination__link--icon"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <span className="ds_pagination__link-label">Previous</span>
            <svg className="ds_icon" aria-hidden="true" role="img">
              <use href="/assets/images/icons/icons.stack.svg#chevron_left"></use>
            </svg>
          </button>
        </li>
        {currentPage > 3 && (
          <li className="ds_pagination__item">
            <button
              aria-label="Page 1"
              className="ds_pagination__link"
              onClick={() => setCurrentPage(1)}
            >
              <span className="ds_pagination__link-label">1</span>
            </button>
          </li>
        )}
        {currentPage > 4 && (
          <li className="ds_pagination__item" aria-hidden="true">
            <span className="ds_pagination__link ds_pagination__link--ellipsis">&hellip;</span>
          </li>
        )}
        {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, i) => i + 1)
          .filter(page => {
            if (currentPage <= 3) {
              return page <= 5;
            } else if (currentPage >= Math.ceil(filteredData.length / rowsPerPage) - 2) {
              return page >= Math.ceil(filteredData.length / rowsPerPage) - 4;
            } else {
              return page >= currentPage - 2 && page <= currentPage + 2;
            }
          })
          .map(page => (
            <li key={page} className="ds_pagination__item">
              <button
                aria-label={`Page ${page}`}
                className={`ds_pagination__link ${currentPage === page ? 'ds_current' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                <span className="ds_pagination__link-label">{page}</span>
              </button>
            </li>
          ))}
        {currentPage < Math.ceil(filteredData.length / rowsPerPage) - 3 && (
          <li className="ds_pagination__item" aria-hidden="true">
            <span className="ds_pagination__link ds_pagination__link--ellipsis">&hellip;</span>
          </li>
        )}
        {currentPage < Math.ceil(filteredData.length / rowsPerPage) - 2 && (
          <li className="ds_pagination__item">
            <button
              aria-label={`Page ${Math.ceil(filteredData.length / rowsPerPage)}`}
              className="ds_pagination__link"
              onClick={() => setCurrentPage(Math.ceil(filteredData.length / rowsPerPage))}
            >
              <span className="ds_pagination__link-label">{Math.ceil(filteredData.length / rowsPerPage)}</span>
            </button>
          </li>
        )}
        <li className="ds_pagination__item">
          <button
            aria-label="Next page"
            className="ds_pagination__link ds_pagination__link--text ds_pagination__link--icon"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(filteredData.length / rowsPerPage)))}
            disabled={currentPage === Math.ceil(filteredData.length / rowsPerPage)}
          >
            <span className="ds_pagination__link-label">Next</span>
            <svg className="ds_icon" aria-hidden="true" role="img">
              <use href="/assets/images/icons/icons.stack.svg#chevron_right"></use>
            </svg>
          </button>
        </li>
      </ul>
    </nav>
  );
  
  export default Pagination;