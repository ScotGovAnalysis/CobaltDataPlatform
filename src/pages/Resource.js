import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';
import styles from '../styles/Design_Style.module.css';
import MapViewerModal from '../components/modals/MapViewerModal';
import ApiModal from '../components/modals/ApiModal';
import DataViewerModal from '../components/modals/DataViewerModal';
import AnalysisModal from '../components/modals/AnalysisModal';
import config from '../config';
import BackToTop from '../components/BackToTop';
import ActionButtons from '../components/ActionButtons';
import { PropagateLoader } from 'react-spinners';
import DataDictionary from '../components/DataDictionary';
import JSONViewerModal from '../components/modals/JSONViewerModal';

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
  const [resourceViewId, setResourceViewId] = useState(null);
  const [analysisData, setAnalysisData] = useState(null);
  const [analysisColumns, setAnalysisColumns] = useState([]);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingMap, setLoadingMap] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [loadingJson, setLoadingJson] = useState(false);
  const [jsonData, setJsonData] = useState(null);

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
        const isJSON = resource.format.toLowerCase() === 'json';
        setHasMap(isGeoJSON);

        if (!isGeoJSON && !isJSON) {
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

  useEffect(() => {
    // Helper function to convert to camel case
    const toCamelCase = (str) => {
      return str.replace(/_/g, ' ').replace(/\w\S*/g, (txt) => {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
      });
    };

    // Dynamically set the page title
    if (dataset && dataset.resources) {
      const resource = dataset.resources.find(r => r.id === resourceId);
      if (resource) {
        document.title = `Cobalt | ${toCamelCase(resource.name)}`;
      } else {
        document.title = "Cobalt | Dataset";
      }
    } else {
      document.title = "Cobalt | Dataset";
    }
  }, [dataset, resourceId]);

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
      if (!resource) throw new Error('Resource not found');

      const response = await fetch(resource.url);
      if (!response.ok) throw new Error('Failed to fetch data');

      const format = resource.format.toLowerCase();

      if (format === 'csv') {
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
        setAnalysisData(data);
        setAnalysisColumns(headers);
      } else if (format === 'json' || format === 'geojson') {
        const jsonData = await response.json();
        let normalizedData = [];
        let columns = [];

        if (format === 'geojson' && jsonData.features) {
          normalizedData = jsonData.features.map(f => ({
            ...f.properties,
            geometry: JSON.stringify(f.geometry)
          }));
          columns = Object.keys(normalizedData[0] || {});
        } else if (Array.isArray(jsonData)) {
          normalizedData = jsonData;
          columns = Object.keys(jsonData[0] || {});
        } else {
          normalizedData = [jsonData];
          columns = Object.keys(jsonData);
        }

        setAnalysisData(normalizedData);
        setAnalysisColumns(columns);
      } else {
        throw new Error('Unsupported file format for analysis');
      }

      setShowAnalysisModal(true);
    } catch (err) {
      console.error('Error loading data for analysis:', err);
      alert('Failed to load data for analysis: ' + err.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const getDataViewerUrl = () => {
    if (!dataset || !resourceViewId) return null;
    const datasetName = dataset.name.replace(/_/g, '_');
    return `${config.apiBaseUrl}/dataset/${datasetName}/resource/${resourceId}/view/${resourceViewId}`;
  };

  const handleViewJson = async () => {
    setLoadingJson(true);
    try {
      const resource = dataset.resources.find(r => r.id === resourceId);
      const response = await fetch(resource.url);
      if (!response.ok) throw new Error('Failed to fetch JSON data');

      const jsonData = await response.json();
      setJsonData(jsonData);
      setShowJsonModal(true);
    } catch (err) {
      console.error('Error loading JSON:', err);
      alert('Failed to load JSON data');
    } finally {
      setLoadingJson(false);
    }
  };

  if (loading) return (
    <div className="ds_page__middle">
      <div className="ds_wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <PropagateLoader
          color="#0065bd"
          loading={true}
          speedMultiplier={1}
        />
      </div>
    </div>
  );

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

            <div
              className="ds_page-header"
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <div style={{ flex: '0 0 115%'}}>
                <h1 className="ds_page-header__title" style={{ marginRight: '100px'}}>{dataset?.title}</h1>
              </div>
              <div style={{ flex: '0 0 0' }}>
                <ActionButtons
                  resourceId={resourceId}
                  resourceUrl={dataset?.resources?.find((r) => r.id === resourceId)?.url}
                  resourceFormat={dataset?.resources?.find((r) => r.id === resourceId)?.format}
                  onApiClick={() => setShowApiModal(true)}
                />
              </div>
            </div>
          </div>

          <div className="ds_layout__sidebar">
            <div className="ds_metadata__panel">
              <h3 className="ds_metadata__panel-title">Metadata</h3>
              <dl className="ds_metadata">
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">File</dt>
                  <dd className="ds_metadata__value">
                    {' '}{dataset?.resources?.find(r => r.id === resourceId)?.name || 'N/A'}
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Size</dt>
                  <dd className="ds_metadata__value">
                    {' '}{((dataset?.resources?.find(r => r.id === resourceId)?.size || 0) / 1024).toFixed(2)} KB
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Date Published</dt>
                  <dd className="ds_metadata__value">
                    {dataset?.metadata_created ? format(new Date(dataset.metadata_created), 'dd MMMM yyyy') : 'N/A'}
                  </dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Last Updated</dt>
                  <dd className="ds_metadata__value">
                    {dataset?.metadata_modified ? format(new Date(dataset.metadata_modified), 'dd MMMM yyyy') : 'N/A'}
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
                      'Not specified'
                    )}
                  </dd>
                </div>
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
                {(hasMap || dataset?.resources.find(r => r.id === resourceId)?.format.toLowerCase() === 'json') && (
                  <li className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <button
                          onClick={handleViewJson}
                          className="ds_category-item__link ds_category-item__link--button"
                          disabled={loadingJson}
                        >
                          {loadingJson ? (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <PropagateLoader
                              color="#0065bd"
                              loading={true}
                              speedMultiplier={1}
                            />
                          </div>
                        ) : (
                          'View JSON'
                        )}
                        </button>
                      </h2>
                      <p className="ds_category-item__summary">
                      Explore the complete JSON document.
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
                        style={{ position: 'relative', display: 'inline-block' }}
                      >
                        {loadingAnalysis ? (
                          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                            <PropagateLoader
                              color="#0065bd"
                              loading={true}
                              speedMultiplier={1}
                            />
                          </div>
                        ) : (
                          'Analyse Data'
                        )}
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

              <DataDictionary dataset={dataset} resourceId={resourceId} config={config} />

            </nav>

            {showMapViewerModal && (
              <MapViewerModal
                data={geoJsonData}
                isOpen={showMapViewerModal}
                onClose={() => setShowMapViewerModal(false)}
              />
            )}
            {showJsonModal && (
              <JSONViewerModal
                isOpen={showJsonModal}
                onClose={() => setShowJsonModal(false)}
                data={jsonData}
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
        data={analysisData}
        columns={analysisColumns}
        fileType={dataset?.resources.find(r => r.id === resourceId)?.format.toLowerCase() || 'csv'}
      />

      <BackToTop />
    </div>
  );
};

export default Resource;
