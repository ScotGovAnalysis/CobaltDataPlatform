import Select from 'react-select';

const Filters = ({
  selectedColumns,
  setSelectedColumns,
  hiddenColumns,
  setHiddenColumns,
  resourceData,
  filterQueries,
  setFilterQueries,
  applyFiltersAndSorting,
  clearFilters,
  handleFilterRemoval
}) => (
  <div className="ds_search-filters">
    <h3>Filters</h3>

    <div className="ds_accordion" data-module="ds-accordion">
      <div className="ds_accordion-item">
        <input type="checkbox" className="visually-hidden ds_accordion-item__control" id="panel-1" />
        <div className="ds_accordion-item__header">
          <h3 className="ds_accordion-item__title">Fields to Include</h3>
          <span className="ds_accordion-item__indicator"></span>
          <label className="ds_accordion-item__label" htmlFor="panel-1">
            <span className="visually-hidden">Show this section</span>
          </label>
        </div>
        <div className="ds_accordion-item__body">
          <div className="ds_facet-group">
            {selectedColumns.map(column => (
              <dd key={column} className="ds_facet-wrapper">
                <span className="ds_facet">
                  {column}
                  <button
                    type="button"
                    aria-label={`Remove '${column}' filter`}
                    className="ds_facet__button"
                    onClick={() => {
                      setSelectedColumns(prev => prev.filter(c => c !== column));
                      setHiddenColumns(prev => [...prev, column]);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
                  </button>
                </span>
              </dd>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="ds_accordion" data-module="ds-accordion">
      <div className="ds_accordion-item">
        <input type="checkbox" className="visually-hidden ds_accordion-item__control" id="panel-2" />
        <div className="ds_accordion-item__header">
          <h3 className="ds_accordion-item__title">Fields Hidden</h3>
          <span className="ds_accordion-item__indicator"></span>
          <label className="ds_accordion-item__label" htmlFor="panel-2">
            <span className="visually-hidden">Show this section</span>
          </label>
        </div>
        <div className="ds_accordion-item__body">
          <div className="ds_facet-group">
            {hiddenColumns.map(column => (
              <dd key={column} className="ds_facet-wrapper">
                <span className="ds_facet">
                  {column}
                  <button
                    type="button"
                    aria-label={`Add '${column}' filter`}
                    className="ds_facet__button"
                    onClick={() => {
                      setHiddenColumns(prev => prev.filter(c => c !== column));
                      setSelectedColumns(prev => [...prev, column]);
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="m336-280 144-144 144 144 56-56-144-144 144-144-56-56-144 144-144-144-56 56 144 144-144 144 56 56ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Z"/></svg>
                  </button>
                </span>
              </dd>
            ))}
          </div>
        </div>
      </div>
    </div>

    <div className="ds_accordion" data-module="ds-accordion">
      <div className="ds_accordion-item">
        <input type="checkbox" className="visually-hidden ds_accordion-item__control" id="panel-3" />
        <div className="ds_accordion-item__header">
          <h3 className="ds_accordion-item__title">Filters</h3>
          <span className="ds_accordion-item__indicator"></span>
          <label className="ds_accordion-item__label" htmlFor="panel-3">
            <span className="visually-hidden">Show this section</span>
          </label>
        </div>
        <div className="ds_accordion-item__body">
          {selectedColumns.map(column => {
            const distinctValues = [...new Set(resourceData.map(row => row[column]))];
            return (
              <div key={column} className="ds_search-filters__filter">
                <label>{column}</label>
                <Select
                  isMulti
                  options={distinctValues.map(value => ({ value, label: value }))}
                  onChange={(selectedOptions) => setFilterQueries({
                    ...filterQueries,
                    [column]: selectedOptions.map(option => option.value).join(', ')
                  })}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {Object.keys(filterQueries).length > 0 && (
      <div className="ds_facet-group">
        <dt className="ds_facet__group-title">Applied Filters:</dt>
        {Object.keys(filterQueries).map(column => (
          <dd key={column} className="ds_facet-wrapper">
            <span className="ds_facet">
              {filterQueries[column]}
              <button
                type="button"
                aria-label={`Remove '${filterQueries[column]}' filter`}
                className="ds_facet__button"
                onClick={() => handleFilterRemoval(column)}
              >
                <svg className="ds_facet__button-icon" aria-hidden="true" role="img" focusable="false">
                  <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                </svg>
              </button>
            </span>
          </dd>
        ))}
      </div>
    )}

    <div className="ds_button-group">
      <button className="ds_button" onClick={applyFiltersAndSorting}>
        Generate
      </button>
      <button className="ds_button ds_button--cancel" onClick={clearFilters}>
        Clear All Filters
      </button>
    </div>
  </div>
);

export default Filters;