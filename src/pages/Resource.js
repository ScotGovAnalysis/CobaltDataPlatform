import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';
import styles from '../styles/Design_Style.module.css';
import DatasetAnalysis from '../components/DatasetAnalysis';
import MapViewerModal from '../components/MapViewerModal';
import ApiModal from '../components/ApiModal';
import DataViewerModal from '../components/DataViewerModal';
import AnalysisModal from '../components/AnalysisModal';
import config from '../config';
import BackToTop from '../components/BackToTop';
import ActionButtons from '../components/ActionButtons';

const Resource = () => {
  const { id, resourceId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [hasMap, setHasMap] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [showDataViewerModal, setShowDataViewerModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [showMapViewerModal, setShowMapViewerModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [dataDictionary, setDataDictionary] = useState([]);
  const [resourceViewId, setResourceViewId] = useState(null);
  const [csvData, setCsvData] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [loadingDictionary, setLoadingDictionary] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

  useEffect(() => {
    if (!id || !resourceId) {
      setError(new Error('Dataset ID or Resource ID is undefined'));
      setLoading(false);
      return;
    }

    const fetchDataset = async () => {
      try {
        const metadataResponse = await fetch(`${config.apiBaseUrl}/api/3/action/package_show?id=${id}`);
        const metadataResult = await metadataResponse.json();
        const datasetResult = metadataResult.result;
        setDataset(datasetResult);

        const resource = datasetResult.resources.find(r => r.id === resourceId);
        if (!resource) throw new Error('Resource not found');

        const isGeoJSON = resource.format.toLowerCase() === 'geojson';
        setHasMap(isGeoJSON);

        if (!isGeoJSON) {
          const viewsResponse = await fetch(
            `${config.apiBaseUrl}/api/3/action/resource_view_list?id=${resourceId}`
          );
          const viewsResult = await viewsResponse.json();

          let viewId;
          if (viewsResult.success && viewsResult.result.length > 0) {
            viewId = viewsResult.result.find(v => v.view_type === 'datatables_view')?.id ||
                     viewsResult.result[0].id;
          } else {
            try {
              const createViewResponse = await fetch(
                `${config.apiBaseUrl}/api/3/action/resource_view_create`,
                {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.apiKey ? config.apiKey : ''
                  },
                  body: JSON.stringify({
                    resource_id: resourceId,
                    title: 'Data Preview',
                    view_type: 'datatables_view'
                  })
                }
              );
              const createViewResult = await createViewResponse.json();
              if (createViewResult.success) {
                viewId = createViewResult.result.id;
              } else {
                console.warn('Failed to create view:', createViewResult.error);
              }
            } catch (err) {
              console.warn('Error creating view:', err);
            }
          }

          setResourceViewId(viewId);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching dataset:', err);
        setError(err);
        setLoading(false);
      }
    };

    fetchDataset();
  }, [id, resourceId]);

  const handleViewMap = async () => {
    try {
      setLoadingMap(true);
      const resource = dataset.resources.find(r => r.id === resourceId);
      if (!resource) throw new Error('Resource not found');

      const response = await fetch(resource.url);
      if (!response.ok) throw new Error('Failed to fetch GeoJSON data');

      const geojsonData = await response.json();
      setGeoJsonData(geojsonData);
      setSelectedView('map');
      setShowMapViewerModal(true);
    } catch (err) {
      console.error('Error loading GeoJSON:', err);
      alert('Failed to load map data');
    } finally {
      setLoadingMap(false);
    }
  };

  const handleOpenAnalysis = async () => {
    setLoadingAnalysis(true);
    try {
      const resource = dataset.resources.find(r => r.id === resourceId);
      const response = await fetch(resource.url);
      const text = await response.text();
      const rows = text.split('\n').filter(row => row.trim() !== '');
      const headers = rows[0].split(',').map(h => h.trim());
      const data = rows.slice(1).map(row => {
        const values = row.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header] = values[index]?.trim();
          return obj;
        }, {});
      });

      setCsvData(data);
      setShowAnalysisModal(true);
    } catch (err) {
      console.error('Error loading CSV data:', err);
      alert('Failed to load CSV data');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const fetchDataDictionary = async () => {
    if (!dataset || loadingDictionary || dataDictionary.length > 0) return;

    setLoadingDictionary(true);
    try {
      const resource = dataset.resources.find(r => r.id === resourceId);
      if (resource.format.toLowerCase() !== 'csv') return;

      try {
        const datastoreResponse = await fetch(
          `${config.apiBaseUrl}/api/3/action/datastore_search?resource_id=${resource.id}&limit=0`
        );
        const datastoreResult = await datastoreResponse.json();

        if (datastoreResult.success) {
          const fields = datastoreResult.result.fields;
          const dictionary = fields.map(field => ({
            name: field.id,
            type: field.type,
            description: field.info?.notes || 'No description available',
          }));
          setDataDictionary(dictionary);
          return;
        }
      } catch (datastoreError) {
        console.log('No datastore info available, falling back to CSV parsing');
      }

      try {
        const headerResponse = await fetch(resource.url, {
          headers: { 'Range': 'bytes=0-10240' }
        });

        const text = await headerResponse.text();
        const firstNewLine = text.indexOf('\n');
        const headerLine = firstNewLine > 0 ? text.substring(0, firstNewLine) : text;
        const headers = headerLine.split(',').map(h => h.trim());

        const dictionary = headers.map(header => ({
          name: header,
          type: 'unknown',
          description: 'No description available',
        }));

        setDataDictionary(dictionary);
      } catch (headerError) {
        console.error('Error loading headers:', headerError);
        const fullResponse = await fetch(resource.url);
        const text = await fullResponse.text();
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const headers = rows[0]?.split(',').map(h => h.trim()) || [];

        const dictionary = headers.map(header => ({
          name: header,
          type: 'unknown',
          description: 'No description available',
        }));

        setDataDictionary(dictionary);
      }
    } catch (err) {
      console.error('Error fetching data dictionary:', err);
    } finally {
      setLoadingDictionary(false);
    }
  };

  const getDataViewerUrl = () => {
    if (!dataset || !resourceViewId) return null;
    const datasetName = dataset.name.replace(/_/g, '_');
    return `${config.apiBaseUrl}/dataset/${datasetName}/resource/${resourceId}/view/${resourceViewId}`;
  };

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading dataset...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_error">
            <p>Error loading dataset: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main className="ds_layout ds_layout--search-results--filters">
          <div className="ds_layout__header w-full">
            <nav aria-label="Breadcrumb">
              <ol className="ds_breadcrumbs">
                <li className={styles.ds_breadcrumbs__item}>
                  <Link className="ds_breadcrumbs__link" to="/">Home</Link>
                </li>
                <li className={styles.ds_breadcrumbs__item}>
                  <Link className="ds_breadcrumbs__link" to="/datasets">Datasets</Link>
                </li>
                <li className={styles.ds_breadcrumbs__item}>
                  <Link className="ds_breadcrumbs__link" to={`/dataset/${id}`}>
                    {dataset?.title || 'Dataset'}
                  </Link>
                </li>
                <li className={styles.ds_breadcrumbs__item}>
                  <span className="ds_breadcrumbs__current">Resource</span>
                </li>
              </ol>
            </nav>

            <div className="ds_page-header">
              <h1 className="ds_page-header__title">{dataset?.title}</h1>
            </div>
          </div>

          <div className="ds_layout__sidebar">
            <div className="ds_metadata__panel">
              <h3 className="ds_metadata__panel-title">Metadata</h3>
              <dl className="ds_metadata">
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Size</dt>
                  <dd className="ds_metadata__value">
                  {' '}{((dataset?.resources?.find(r => r.id === resourceId)?.size || 0) / 1024).toFixed(2)} KB
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Date Published</dt>
                  <dd className="ds_metadata__value">
                     {dataset?.metadata_created ? format(new Date(dataset.metadata_created), ' dd MMMM yyyy') : ' N/A'}
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Last Updated</dt>
                  <dd className="ds_metadata__value">
                     {dataset?.metadata_modified ? format(new Date(dataset.metadata_modified), ' dd MMMM yyyy') : ' N/A'}
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">License</dt>
                  <dd className="ds_metadata__value">
    {dataset.license_title ? (
      <>
        {' '}<a href={dataset.license_title} className="ds_link">{dataset.license_title}</a>
      </>
    ) : (
      ' Not specified'
    )}
  </dd>                </div>
                {dataset?.frequency && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Update Frequency</dt>
                    <dd className="ds_metadata__value"> {dataset.frequency}</dd>
                  </div>
                )}
                {dataset?.spatial && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Geographic Coverage</dt>
                    <dd className="ds_metadata__value"> {dataset.spatial}</dd>
                  </div>
                )}
                {dataset?.temporal_coverage && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Temporal Coverage</dt>
                    <dd className="ds_metadata__value"> {dataset.temporal_coverage}</dd>
                  </div>
                )}
                {dataset?.maintainer_email && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Contact</dt>
                    <dd className="ds_metadata__value">{' '}
                      <a href={`mailto:${dataset.maintainer_email}`} className="ds_link">
                        {dataset.maintainer_email}
                      </a>
                    </dd>
                  </div>
                )}

              </dl>
            </div>
          </div>

          <div className="ds_layout__list">
            {!hasMap && (
              <ActionButtons
                resourceId={resourceId}
                resourceUrl={dataset?.resources?.find(r => r.id === resourceId)?.url}
                resourceFormat={dataset?.resources?.find(r => r.id === resourceId)?.format}
                onApiClick={() => setShowApiModal(true)}
              />
            )}
            <section className={styles.section}>
              {dataset.resources[0]?.description ? (
                dataset.resources[0].description.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>No description available</p>
              )}
            </section>

            <hr />

            <nav aria-label="Data view navigation">
              <ul className="ds_category-list ds_category-list--grid ds_category-list--narrow">
                {resourceViewId && !hasMap && (
                  <li className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <button
                          onClick={() => setShowDataViewerModal(true)}
                          className="ds_category-item__link ds_category-item__link--button"
                        >
                          View Data
                        </button>
                      </h2>
                      <p className="ds_category-item__summary">
                        Explore and filter the raw data in a table format.
                      </p>
                    </article>
                  </li>
                )}
                <li className="ds_card ds_card--has-hover">
                  <article className="ds_category-item ds_category-item--card">
                    <h2 className="ds_category-item__title">
                      <button
                        onClick={handleOpenAnalysis}
                        className="ds_category-item__link ds_category-item__link--button"
                        disabled={loadingAnalysis}
                      >
                        {loadingAnalysis ? 'Loading...' : 'Analyse Data'}
                      </button>
                    </h2>
                    <p className="ds_category-item__summary">
                      View statistics and analysis of the dataset.
                    </p>
                  </article>
                </li>
                {hasMap && (
                  <li className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <button
                          onClick={handleViewMap}
                          className="ds_category-item__link ds_category-item__link--button"
                          disabled={loadingMap}
                        >
                          {loadingMap ? 'Loading Map...' : 'View Map'}
                        </button>
                      </h2>
                      <p className="ds_category-item__summary">
                        Explore the geographical data visualisation.
                      </p>
                    </article>
                  </li>
                )}
              </ul>

              <div className="ds_accordion" style={{ width: '100%', marginTop: '2rem' }}>
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    id="data-dictionary-accordion"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    onChange={(e) => {
                      if (e.target.checked && !dataDictionary.length && !loadingDictionary) {
                        fetchDataDictionary();
                      }
                      setIsDictionaryOpen(e.target.checked);
                    }}
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">
                      Data Dictionary
                      {loadingDictionary &&
                        <span className="ds_loading__spinner" style={{ marginLeft: '1rem', width: '1.5rem', height: '1.5rem' }}></span>}
                    </h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="data-dictionary-accordion">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <div className={styles.tableWrapper}>
                      {dataDictionary.length > 0 ? (
                        <table className={styles.tableModern}>
                          <thead>
                            <tr>
                              <th>Field Name</th>
                              <th>Type</th>
                              <th>Description</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataDictionary
                              .filter(field => field.name !== '_id')
                              .map((field, index) => (
                                <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                                  <td><span className={styles.fieldName}>{field.name}</span></td>
                                  <td>
                                    <span className={styles.typeBadge}>
                                      {field.type}
                                    </span>
                                  </td>
                                  <td>{field.description}</td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      ) : (
                        !loadingDictionary && <p className="ds_message ds_message--info">No data dictionary available.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </nav>

            {showMapViewerModal && (
              <MapViewerModal
                data={geoJsonData}
                isOpen={showMapViewerModal}
                onClose={() => setShowMapViewerModal(false)}
              />
            )}
          </div>
        </main>
      </div>

      {!hasMap && (
        <ApiModal
          resourceId={resourceId}
          isOpen={showApiModal}
          onClose={() => setShowApiModal(false)}
        />
      )}

      {!hasMap && (
        <DataViewerModal
          isOpen={showDataViewerModal}
          onClose={() => setShowDataViewerModal(false)}
          src={getDataViewerUrl()}
        />
      )}

      <AnalysisModal
        isOpen={showAnalysisModal}
        onClose={() => setShowAnalysisModal(false)}
      >
        <DatasetAnalysis
          resourceId={resourceId}
          data={csvData}
          columns={Object.keys(csvData[0] || {})}
        />
      </AnalysisModal>

      <BackToTop />
    </div>
  );
};

export default Resource;
