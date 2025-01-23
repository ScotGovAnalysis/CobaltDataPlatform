import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';

const DatasetExplorer = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Sorting and Filtering States
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterQuery, setFilterQuery] = useState('');

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
          
          const [headers, ...rows] = csvText.split('\n')
            .map(row => row.split(','))
            .filter(row => row.length > 1);

          const parsedData = rows.map(row => 
            Object.fromEntries(headers.map((header, index) => [header, row[index]]))
          );

          setCsvData(parsedData);
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

  // Sorting Function
  const sortedData = useMemo(() => {
    let sortableData = [...csvData];
    if (sortConfig.key !== null) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [csvData, sortConfig]);

  // Filtering Function
  const filteredData = useMemo(() => {
    return sortedData.filter(row => 
      Object.values(row).some(value => 
        value.toString().toLowerCase().includes(filterQuery.toLowerCase())
      )
    );
  }, [sortedData, filterQuery]);

  // Pagination
  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage]);

  // Sorting Handler
  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Pagination Calculations
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

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
                <button 
                  className={`ds_tabs__tab-link ${activeTab === 'overview' ? 'ds_tabs__tab-link--current' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Overview
                </button>
              </li>
              <li className="ds_tabs__tab">
                <button 
                  className={`ds_tabs__tab-link ${activeTab === 'data' ? 'ds_tabs__tab-link--current' : ''}`}
                  onClick={() => setActiveTab('data')}
                >
                  Data
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="ds_tabs__content ds_tabs__content--bordered">
          {activeTab === 'overview' && (
            <div>
              <h2>Description</h2>
              <p>{dataset.notes || 'No description available'}</p>
            </div>
          )}

          {activeTab === 'data' && (
            <div>
              {/* Search and Filter */}
              <div className="ds_search">
                <input 
                  type="text" 
                  className="ds_input ds_input--text" 
                  placeholder="Filter data..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>

              {/* Data Table */}
              <table className="ds_table ds_table--hover">
                <thead>
                  <tr>
                    {csvData.length > 0 && Object.keys(csvData[0]).map(header => (
                      <th key={header}>
                        <button 
                          className="ds_table__sortable"
                          onClick={() => handleSort(header)}
                        >
                          {header}
                          {sortConfig.key === header && (
                            <span>{sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}</span>
                          )}
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginatedData.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <td key={cellIndex}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <nav className="ds_pagination" aria-label="Search result pages">
                <ul className="ds_pagination__list">
                  {[...Array(totalPages)].map((_, index) => (
                    <li 
                      key={index} 
                      className="ds_pagination__item"
                    >
                      <button 
                        className={`ds_pagination__link ${currentPage === index + 1 ? 'ds_current' : ''}`}
                        onClick={() => setCurrentPage(index + 1)}
                      >
                        <span className="ds_pagination__link-label">{index + 1}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetExplorer;