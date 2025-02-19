import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';
import styles from '../styles/Design_Style.module.css';
import DatasetAnalysis from './DatasetAnalysis';
import MapViewer from '../components/MapViewer';
import ApiModal from '../components/ApiModal';
import DataViewerModal from '../components/DataViewerModal'; // Import the new modal
import config from '../config';

const Resource = () => {
  const { id, resourceId } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [hasMap, setHasMap] = useState(false);
  const [selectedView, setSelectedView] = useState(null);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showDataViewerModal, setShowDataViewerModal] = useState(false); // State for data viewer modal
  const [dataDictionary, setDataDictionary] = useState([]);
  const [resourceViewId, setResourceViewId] = useState(null);
  const [csvData, setCsvData] = useState([]);

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

        if (resource.format.toLowerCase() === 'csv') {
          const response = await fetch(resource.url);
          const text = await response.text();
          const rows = text.split('\n').filter(row => row.trim() !== '');
          const headers = rows[0].split(',');
          const data = rows.slice(1).map(row => {
            const values = row.split(',');
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {});
          });
          setCsvData(data);
        }

        const viewsResponse = await fetch(
          `${config.apiBaseUrl}/api/3/action/resource_view_list?id=${resourceId}`
        );
        const viewsResult = await viewsResponse.json();

        let viewId;
        if (viewsResult.success && viewsResult.result.length > 0) {
          viewId = viewsResult.result.find(v => v.view_type === 'datatables_view')?.id ||
                  viewsResult.result[0].id;
        } else {
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
          viewId = createViewResult.result.id;
        }

        setResourceViewId(viewId);

        const datastoreResponse = await fetch(`${config.apiBaseUrl}/api/3/action/datastore_search?resource_id=${resourceId}&limit=10`);
        const datastoreResult = await datastoreResponse.json();

        const fields = datastoreResult.result?.fields || [];
        const dictionary = fields.map(field => ({
          name: field.id,
          type: field.type || 'unknown',
          description: field.info?.notes || 'No description available.',
        }));
        setDataDictionary(dictionary);

        if (resource.format.toLowerCase() === 'geojson') {
          const response = await fetch(resource.url);
          const geojsonData = await response.json();
          setGeoJsonData(geojsonData);
          setHasMap(true);
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

  const handleDownload = () => {
    const resource = dataset?.resources?.find(r => r.id === resourceId);
    if (resource?.url) {
      window.location.href = resource.url;
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
                <li className="ds_breadcrumbs__item">
                  <Link to="/" className="ds_breadcrumbs__link">Home</Link>
                </li>
                <li className="ds_breadcrumbs__item">
                  <Link to={`/dataset/${id}`} className="ds_breadcrumbs__link">Dataset</Link>
                </li>
                <li className="ds_breadcrumbs__item">
                  <span className="ds_breadcrumbs__current">Explore</span>
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
                    {((dataset?.resources?.find(r => r.id === resourceId)?.size || 0) / 1024).toFixed(2)} KB
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
                  <dd className="ds_metadata__value">{dataset?.license_title || 'Not specified'}</dd>
                </div>
                {dataset?.frequency && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Update Frequency</dt>
                    <dd className="ds_metadata__value">{dataset.frequency}</dd>
                  </div>
                )}
                {dataset?.spatial && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Geographic Coverage</dt>
                    <dd className="ds_metadata__value">{dataset.spatial}</dd>
                  </div>
                )}
                {dataset?.temporal_coverage && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Temporal Coverage</dt>
                    <dd className="ds_metadata__value">{dataset.temporal_coverage}</dd>
                  </div>
                )}
                {dataset?.contact_email && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Contact</dt>
                    <dd className="ds_metadata__value">
                      <a href={`mailto:${dataset.contact_email}`} className="ds_link">
                        {dataset.contact_email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
              {dataset?.tags && dataset?.tags.length > 0 && (
                <section className={styles.section}>
                  <h3 className="ds_metadata__panel-title">Tags</h3>
                  <div className={styles.tagContainer}>
                    {dataset.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/results?q=${encodeURIComponent(tag.name)}`}
                        className="ds_button ds_button--secondary"
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>

          <div className="ds_layout__list">
            <section className={styles.section}>
              {dataset.notes ? (
                dataset.notes.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>No description available</p>
              )}
            </section>
            <div className="ds_button-group" style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="ds_button" onClick={handleDownload}>
                Download
              </button>
              <button
                className="ds_button ds_button--secondary"
                onClick={() => setShowApiModal(true)}
              >
                API
              </button>
            </div>
            <hr />

            {!selectedView ? (
              <nav aria-label="Data view navigation">
                <ul className="ds_category-list ds_category-list--grid ds_category-list--narrow">
                  <li className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <button
                          onClick={() => setShowDataViewerModal(true)} // Open modal instead of setting view
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
                  <li className="ds_card ds_card--has-hover">
                    <article className="ds_category-item ds_category-item--card">
                      <h2 className="ds_category-item__title">
                        <button
                          onClick={() => setSelectedView('analysis')}
                          className="ds_category-item__link ds_category-item__link--button"
                        >
                          Analyze Data
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
                          <button onClick={() => setSelectedView('map')} className="ds_category-item__link">
                            View Map
                          </button>
                        </h2>
                        <p className="ds_category-item__summary">
                          Explore the geographical data visualization.
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
                    />
                    <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                      <h3 className="ds_accordion-item__title">Data Dictionary</h3>
                      <span className={styles.accordionIndicator}></span>
                      <label className="ds_accordion-item__label" htmlFor="data-dictionary-accordion">
                        <span className="visually-hidden">Show this section</span>
                      </label>
                    </div>
                    <div className="ds_accordion-item__body">
                      <div style={{ width: '100%', overflowX: 'auto' }}>
                        {dataDictionary.length > 0 ? (
                          <table className="ds_table" style={{ width: '100%' }}>
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
                </div>
              </nav>
            ) : (
              <div className="ds_search-results">
                {selectedView === 'analysis' && (
                  <DatasetAnalysis resourceId={resourceId} data={csvData} columns={Object.keys(csvData[0] || {})} />
                )}
                {selectedView === 'map' && hasMap && (
                  <MapViewer data={geoJsonData} />
                )}
                <button
                  className="ds_button ds_button--secondary"
                  onClick={() => setSelectedView(null)}
                  style={{ marginTop: '1rem' }}
                >
                  Back to Resource
                </button>
              </div>
            )}
          </div>
        </main>
      </div>

      <ApiModal
        resourceId={resourceId}
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
      />

      <DataViewerModal
        isOpen={showDataViewerModal}
        onClose={() => setShowDataViewerModal(false)}
        src={getDataViewerUrl()}
      />
    </div>
  );
};

export default Resource;
