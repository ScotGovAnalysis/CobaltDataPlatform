import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import Papa from 'papaparse';
import Select from 'react-select';
import DatasetAnalysis from './DatasetAnalysis';
import MapViewer from '../components/MapViewer';
import Breadcrumbs from '../components/Breadcrumbs';
import Tabs from '../components/Tabs';
import Filters from '../components/Filters';
import DataTable from '../components/DataTable';
import Pagination from '../components/Pagination';
import config from '../config';

const DatasetExplorer = () => {
  const { id, resourceId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [resourceData, setResourceData] = useState([]);
  const [resourceFormat, setResourceFormat] = useState(null);

  const [selectedColumns, setSelectedColumns] = useState([]);
  const [hiddenColumns, setHiddenColumns] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filterQueries, setFilterQueries] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [dataDictionary, setDataDictionary] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        const metadataResponse = await fetch(`${config.apiBaseUrl}/api/3/action/package_show?id=${id}`);
        const metadataResult = await metadataResponse.json();
        const datasetResult = metadataResult.result;
        setDataset(datasetResult);
  
        const resource = datasetResult.resources.find(r => r.id === resourceId);
        if (!resource) {
          throw new Error('Resource not found');
        }
  
        // Fetch the data dictionary using datastore_search
        const datastoreResponse = await fetch(`${config.apiBaseUrl}/api/3/action/datastore_search?id=${resourceId}`);
        const datastoreResult = await datastoreResponse.json();
        console.log('Datastore Result:', datastoreResult); // Debugging line
  
        // Extract fields from the datastore response
        const fields = datastoreResult.result?.fields || [];
        const dictionary = fields.map(field => ({
          name: field.id, // Field name
          type: field.type || 'unknown', // Field type
          description: field.info?.notes || 'No description available.', // Field description
        }));
        setDataDictionary(dictionary);
  
        setResourceFormat(resource.format.toLowerCase());
        
        switch (resource.format.toLowerCase()) {
          case 'csv': {
            const response = await fetch(resource.url);
            const csvText = await response.text();
            Papa.parse(csvText, {
              header: true,
              complete: (results) => {
                setResourceData(results.data);
                setFilteredData(results.data);
                setSelectedColumns(results.meta.fields);
              }
            });
            break;
          }
          case 'geojson': {
            const response = await fetch(resource.url);
            const geojsonData = await response.json();
            const features = geojsonData.features || [];
            const flattenedData = features.map(feature => ({
              ...feature.properties,
              geometry_type: feature.geometry?.type,
              coordinates: JSON.stringify(feature.geometry?.coordinates)
            }));
            const columns = Array.from(new Set(flattenedData.flatMap(item => Object.keys(item))));
            setResourceData(flattenedData);
            setFilteredData(flattenedData);
            setSelectedColumns(columns);
            setGeoJsonData(geojsonData);
            break;
          }
          default:
            throw new Error(`Unsupported format: ${resource.format}`);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dataset:', err);
        setError(err);
        setLoading(false);
      }
    };

    if (id && resourceId) {
      fetchDataset();
    }
  }, [id, resourceId]);

  useEffect(() => {
    setCsvData(filteredData);
  }, [filteredData]);

  const applyFiltersAndSorting = () => {
    let data = [...resourceData];

    if (Object.keys(filterQueries).length > 0) {
      data = data.filter(row =>
        Object.keys(filterQueries).every(key =>
          row[key]?.toString().toLowerCase().includes(filterQueries[key].toLowerCase())
        )
      );
    }

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
    setCurrentPage(1);
  };

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const paginatedData = useMemo(() => {
    const firstPageIndex = (currentPage - 1) * rowsPerPage;
    const lastPageIndex = firstPageIndex + rowsPerPage;
    return filteredData.slice(firstPageIndex, lastPageIndex);
  }, [filteredData, currentPage]);

  const downloadCSV = () => {
    const csv = Papa.unparse(filteredData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${dataset.title}_filtered.csv`;
    link.click();
  };

  const clearFilters = () => {
    setFilterQueries({});
    setSelectedColumns(resourceData.length > 0 ? Object.keys(resourceData[0]) : []);
    setHiddenColumns([]);
    applyFiltersAndSorting();
  };

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
        <Breadcrumbs dataset={dataset} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} resourceFormat={resourceFormat} />

            <div className="ds_tabs__content ds_tabs__content--bordered" id="overview">
            {activeTab === 'overview' && (
              <div>
                {/* Description Accordion */}
                <div className="ds_accordion">
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    id="description-accordion"
                    className="visually-hidden ds_accordion-item__control"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">Description</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label className="ds_accordion-item__label" htmlFor="description-accordion">
                      <span className="visually-hidden">Show this section</span>
                      </label>
                    </div>
                    <div className="ds_accordion-item__body">
                      {dataset.notes ? (
                        dataset.notes.split('\n').map((paragraph, index) => (
                          <p key={index}>{paragraph}</p>
                        ))
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                  </div>
                </div>
          
                {/* Data Dictionary Accordion */}
                <div className="ds_accordion">
  <div className="ds_accordion-item">
    <input
      type="checkbox"
      id="data-dictionary-accordion"
      className="visually-hidden ds_accordion-item__control"
    />
    <div className="ds_accordion-item__header">
      <h3 className="ds_accordion-item__title">Data Dictionary</h3>
      <span className="ds_accordion-item__indicator"></span>
      <label className="ds_accordion-item__label" htmlFor="data-dictionary-accordion">
        <span className="visually-hidden">Show this section</span>
      </label>
    </div>
    <div className="ds_accordion-item__body">
  {dataDictionary.length > 0 ? (
    <table className="ds_table">
      <thead>
        <tr>
          <th>Field Name</th>
          <th>Type</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {dataDictionary
          .filter(field => field.name !== '_id') // Filter out rows where name is '_id'
          .map((field, index) => (
            <tr key={index}>
              <td>{field.name}</td>
              <td>{field.type}</td>
              <td>{field.description}</td>
            </tr>
          ))}
      </tbody>
    </table>
  ) : (
    <p>No data dictionary available.</p>
  )}
</div>
  </div>
</div>
          
                {/* Filters Section */}
                <Filters
                  selectedColumns={selectedColumns}
                  setSelectedColumns={setSelectedColumns}
                  hiddenColumns={hiddenColumns}
                  setHiddenColumns={setHiddenColumns}
                  resourceData={resourceData}
                  filterQueries={filterQueries}
                  setFilterQueries={setFilterQueries}
                  applyFiltersAndSorting={applyFiltersAndSorting}
                  clearFilters={clearFilters}
                  handleFilterRemoval={handleFilterRemoval}
                />
              </div>
            )}
          </div>


        <div className="ds_tabs__content ds_tabs__content--bordered" id="data">
          {activeTab === 'data' && (
            <div>
              <button className="ds_button" onClick={downloadCSV}>
                Download CSV
              </button>
              <DataTable
                selectedColumns={selectedColumns}
                paginatedData={paginatedData}
                sortConfig={sortConfig}
                handleSort={handleSort}
              />
              <Pagination
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                filteredData={filteredData}
                rowsPerPage={rowsPerPage}
              />
            </div>
          )}
        </div>

        <div className="ds_tabs__content ds_tabs__content--bordered" id="analyse">
          {activeTab === 'analyse' && (
            <DatasetAnalysis data={csvData} columns={selectedColumns} />
          )}
        </div>

        <div className="ds_tabs__content ds_tabs__content--bordered" id="map">
          {activeTab === 'map' && resourceFormat === 'geojson' && (
            <div>
              <h3>Geographic Data Visualization</h3>
              {geoJsonData ? (
                <MapViewer
                  data={geoJsonData}
                  properties={selectedColumns.filter(col =>
                    col !== 'geometry_type' &&
                    col !== 'coordinates'
                  )}
                />
              ) : (
                <p>Loading map data...</p>
              )}
              <div style={{ marginTop: '20px' }}>
                <h3>Feature Properties</h3>
                <table className="ds_table">
                  <thead>
                    <tr>
                      {selectedColumns
                        .filter(col => col !== 'geometry_type' && col !== 'coordinates')
                        .map(header => (
                          <th key={header}>{header}</th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.slice(0, 10).map((row, index) => (
                      <tr key={index}>
                        {selectedColumns
                          .filter(col => col !== 'geometry_type' && col !== 'coordinates')
                          .map(col => (
                            <td key={col}>{row[col]}</td>
                          ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatasetExplorer;