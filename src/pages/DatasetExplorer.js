import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import Papa from 'papaparse';
import Select from 'react-select';
import Plot from 'react-plotly.js';
import DatasetAnalysis from './DatasetAnalysis'

const DatasetExplorer = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // States for filtering, sorting, and column selection
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterQueries, setFilterQueries] = useState({});
  const [filteredData, setFilteredData] = useState([]);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const metadataResponse = await fetch(`/api/3/action/package_show?id=${id}`);
        const metadataResult = await metadataResponse.json();
        const datasetResult = metadataResult.result;
        setDataset(datasetResult);

        const csvResource = datasetResult.resources.find(
          r => r.format.toLowerCase() === 'csv'
        );

        if (csvResource) {
          const csvResponse = await fetch(`/dataset/${datasetResult.id}/resource/${csvResource.id}/download/${csvResource.name}`);

          if (!csvResponse.ok) {
            throw new Error(`HTTP error! status: ${csvResponse.status}`);
          }

          const csvText = await csvResponse.text();

          Papa.parse(csvText, {
            header: true,
            complete: (results) => {
              setCsvData(results.data);
              setFilteredData(results.data); // Initialize filtered data
              setSelectedColumns(results.meta.fields); // Set all columns as selected by default
            }
          });
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dataset:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (id) {
      fetchDataset();
    }
  }, [id]);

  // Apply Filters and Sorting
  const applyFiltersAndSorting = () => {
    let data = [...csvData];

    // Apply Filters
    if (Object.keys(filterQueries).length > 0) {
      data = data.filter(row =>
        Object.keys(filterQueries).every(key =>
          row[key]?.toString().toLowerCase().includes(filterQueries[key].toLowerCase())
        )
      );
    }

    // Apply Sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredData(data);
    setCurrentPage(1); // Reset to first page after applying filters
  };

  // Sorting Handler
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Pagination
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage]);

  // Download CSV
  const downloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset.title}_filtered.csv`;
    link.click();
  };

  // Clear Filters
  const clearFilters = () => {
    setFilterQueries({});
    setSelectedColumns(csvData.length > 0 ? Object.keys(csvData[0]) : []);
    setHiddenColumns([]);
    applyFiltersAndSorting();
  };

  // Handle Filter Removal
  const handleFilterRemoval = (column) => {
    setFilterQueries(prev => {
      const { [column]: _, ...rest } = prev;
      return rest;
    });
    applyFiltersAndSorting();
  };

  if (loading) {
    return (
      <div className="ds_loading">
        <div className="ds_loading__spinner"></div>
        <p>Loading dataset...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds_error">
        <p>Error loading dataset: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="ds_breadcrumbs">
            <li className="ds_breadcrumbs__item">
              <a href="/" className="ds_breadcrumbs__link">Home</a>
            </li>
            <li className="ds_breadcrumbs__item">
              <a href="/datasets" className="ds_breadcrumbs__link">Datasets</a>
            </li>
            <li className="ds_breadcrumbs__item">
              <span className="ds_breadcrumbs__link ds_breadcrumbs__link--current">
                {dataset.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Tabs Section */}
        <div className="ds_tabs" data-module="ds-tabs">
          <nav className="ds_tabs__navigation" aria-labelledby="ds_tabs__title">
            <h2 id="ds_tabs__title" className="ds_tabs__title">Dataset Contents</h2>
            <ul className="ds_tabs__list" id="tablist">
              <li className="ds_tabs__tab">
                <a
                  className={`ds_tabs__tab-link ${activeTab === 'overview' ? 'ds_tabs__tab-link--current' : ''}`}
                  href="#overview"
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </a>
              </li>
              <li className="ds_tabs__tab">
                <a
                  className={`ds_tabs__tab-link ${activeTab === 'data' ? 'ds_tabs__tab-link--current' : ''}`}
                  href="#data"
                  onClick={() => setActiveTab('data')}
                >
                  Data
                </a>
              </li>
              <li className="ds_tabs__tab">
                <a
                  className={`ds_tabs__tab-link ${activeTab === 'analyse' ? 'ds_tabs__tab-link--current' : ''}`}
                  href="#analyse"
                  onClick={() => setActiveTab('analyse')}
                >
                  Analyse this Dataset
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="ds_tabs__content ds_tabs__content--bordered" id="overview">
          {activeTab === 'overview' && (
            <div>
              <h2>Description</h2>
              <p>{dataset.notes || 'No description available'}</p>

              {/* Filters and Column Selection */}
              <div className="ds_search-filters">
                <h3>Filters</h3>

                {/* Fields to Include */}
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

                {/* Fields Hidden */}
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

                {/* Filters */}
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
                        const distinctValues = [...new Set(csvData.map(row => row[column]))];
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

                {/* Applied Filters */}
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

                {/* Generate and Clear Filters Buttons */}
                <div className="ds_button-group">
                  <button className="ds_button" onClick={applyFiltersAndSorting}>
                    Generate
                  </button>
                  <button className="ds_button ds_button--cancel" onClick={clearFilters}>
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Data Tab */}
        <div className="ds_tabs__content ds_tabs__content--bordered" id="data">
          {activeTab === 'data' && (
            <div>
              {/* Download Button */}
              <button className="ds_button" onClick={downloadCSV}>
                Download CSV
              </button>

              {/* Data Table */}
              <table className="ds_table">
                <thead>
                  <tr>
                    {selectedColumns.map(header => (
                      <th key={header} onClick={() => handleSort(header)} style={{ cursor: 'pointer' }}>
                        {header}
                        {sortConfig.key === header && (
                          <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index}>
                      {selectedColumns.map(col => (
                        <td key={col}>{row[col]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <nav className="ds_pagination" aria-label="Search result pages">
                <ul className="ds_pagination__list">
                  {/* Previous Button */}
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

                  {/* First Page */}
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

                  {/* Ellipsis Before Current Page */}
                  {currentPage > 4 && (
                    <li className="ds_pagination__item" aria-hidden="true">
                      <span className="ds_pagination__link ds_pagination__link--ellipsis">&hellip;</span>
                    </li>
                  )}

                  {/* Visible Pages Around Current Page */}
                  {Array.from({ length: Math.ceil(filteredData.length / rowsPerPage) }, (_, i) => i + 1)
                    .filter(page => {
                      if (currentPage <= 3) {
                        return page <= 5; // Show first 5 pages
                      } else if (currentPage >= Math.ceil(filteredData.length / rowsPerPage) - 2) {
                        return page >= Math.ceil(filteredData.length / rowsPerPage) - 4; // Show last 5 pages
                      } else {
                        return page >= currentPage - 2 && page <= currentPage + 2; // Show 5 pages around current page
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

                  {/* Ellipsis After Current Page */}
                  {currentPage < Math.ceil(filteredData.length / rowsPerPage) - 3 && (
                    <li className="ds_pagination__item" aria-hidden="true">
                      <span className="ds_pagination__link ds_pagination__link--ellipsis">&hellip;</span>
                    </li>
                  )}

                  {/* Last Page */}
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

                  {/* Next Button */}
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
            </div>
          )}
        </div>

        {/* Analyse this Dataset Tab */}
        <div className="ds_tabs__content ds_tabs__content--bordered" id="analyse">
          {activeTab === 'analyse' && (
            <DatasetAnalysis data={csvData} columns={selectedColumns} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetExplorer;