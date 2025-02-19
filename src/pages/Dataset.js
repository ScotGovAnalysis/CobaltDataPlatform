import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';
import '../index.css';
import config from '../config';

const Dataset = () => {
  const { id } = useParams();
  const location = useLocation();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine if the user came from the Results page
  const isFromResultsPage = location.state?.fromResults || false;
  const searchQuery = location.state?.searchQuery || '';

  const getThumbnailImage = (format) => {
    switch (format.toLowerCase()) {
      case 'csv':
        return '/documents/csv.svg';
      case 'pdf':
        return '/documents/pdf.svg';
      case 'xls':
        return '/documents/excel.svg';
      case 'geojson':
        return '/documents/geodata.svg';
      default:
        return '/documents/generic.svg';
    }
  };

  useEffect(() => {
    const fetchDatasetDetails = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/3/action/package_show?id=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dataset details');
        }
        const data = await response.json();
        setDataset(data.result);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (id) {
      fetchDatasetDetails();
    } else {
      setError(new Error('Dataset ID is undefined'));
      setLoading(false);
    }
  }, [id]);

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
            <p>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <div className="ds_layout gov_layout--publication">
          {/* Sidebar Metadata Section */}
          <aside className="ds_layout__sidebar">
            <div className="ds_metadata__panel">
              <h2 className="ds_metadata__panel-title">Metadata</h2>
              <dl className="ds_metadata">
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Author</dt>
                  <dd className="ds_metadata__value">{dataset.author}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Organisation</dt>
                  <dd className="ds_metadata__value">{dataset.organization?.title || 'Not specified'}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">License</dt>
                  <dd className="ds_metadata__value">{dataset.license_title || 'Not specified'}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Published</dt>
                  <dd className="ds_metadata__value">{format(new Date(dataset.metadata_created), 'dd MMMM yyyy')}</dd>
                </div>
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Last Modified</dt>
                  <dd className="ds_metadata__value">{format(new Date(dataset.metadata_modified), 'dd MMMM yyyy')}</dd>
                </div>
                {dataset.frequency && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Update Frequency</dt>
                    <dd className="ds_metadata__value">{dataset.frequency}</dd>
                  </div>
                )}
                {dataset.spatial && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Geographic Coverage</dt>
                    <dd className="ds_metadata__value">{dataset.spatial}</dd>
                  </div>
                )}
                {dataset.temporal_coverage && (
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Temporal Coverage</dt>
                    <dd className="ds_metadata__value">{dataset.temporal_coverage}</dd>
                  </div>
                )}
                {dataset.contact_email && (
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
            </div>
          </aside>

          {/* Main Content Section */}
          <div className="ds_layout__content">
            <main id="main-content">
              {/* Header Section */}
              <header className="ds_page-header gov_sublayout gov_sublayout--publication-header">
                <div className="gov_sublayout__title">
                  <span className="ds_page-header__label ds_content-label">Dataset</span>
                  <h1 className="ds_page-header__title">{dataset.title}</h1>
                </div>
              </header>

              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb">
                <ol className="ds_breadcrumbs">
                  <li className="ds_breadcrumbs__item">
                    <Link className="ds_breadcrumbs__link" to="/">Home</Link>
                  </li>
                  {isFromResultsPage ? (
                    <>
                      <li className="ds_breadcrumbs__item">
                        <Link className="ds_breadcrumbs__link" to={`/results?q=${searchQuery}`}>Results</Link>
                      </li>
                      <li className="ds_breadcrumbs__item">
                        <span className="ds_breadcrumbs__current">Dataset: {dataset.title}</span>
                      </li>
                    </>
                  ) : (
                    <>
                      <li className="ds_breadcrumbs__item">
                        <Link className="ds_breadcrumbs__link" to="/datasets">Datasets</Link>
                      </li>
                      <li className="ds_breadcrumbs__item">
                        <span className="ds_breadcrumbs__current">{dataset.title}</span>
                      </li>
                    </>
                  )}
                </ol>
              </nav>

              <hr />

              {/* Description Section */}
              <section>
                <h2 className="ds_h3">Description</h2>
                {dataset.notes ? (
                  dataset.notes.split('\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>No description available</p>
                )}
              </section>

              {/* Tags Section */}
              {dataset.tags && dataset.tags.length > 0 && (
                <section>
                  <h2 className="ds_h3">Tags</h2>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                    {dataset.tags.map((tag, index) => (
                      <Link
                        key={index}
                        to={`/results?q=${encodeURIComponent(tag.name)}`}
                        className="ds_button ds_button--secondary"
                        style={{ marginBottom: '0.5rem' }}
                      >
                        {tag.name}
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Resources Section */}
              <section>
                <h2 className="ds_h3">Resources</h2>
                <div className="ds_file-download-list">
                  {dataset.resources.map((resource, index) => (
                    <div key={index} className="ds_file-download">
                      <div className="ds_file-download__thumbnail">
                        <a
                          className="ds_file-download__thumbnail-link"
                          aria-hidden="true"
                          tabIndex="-1"
                          href={resource.url}
                        >
                          <span className="visually-hidden">Document cover image</span>
                          <img
                            className="ds_file-download__thumbnail-image"
                            src={getThumbnailImage(resource.format)}
                            alt=""
                          />
                        </a>
                      </div>
                      <div className="ds_file-download__content">
                        <a
                          href={resource.url}
                          className="ds_file-download__title"
                          aria-describedby={`file-download-${index}`}
                        >
                          {resource.name || `Resource ${index + 1}`}
                        </a>

                        <div id={`file-download-${index}`} className="ds_file-download__details">
                          <dl className="ds_metadata ds_metadata--inline">
                            <div className="ds_metadata__item">
                              <dt className="ds_metadata__key visually-hidden">File type</dt>
                              <dd className="ds_metadata__value">
                                {resource.format || 'Unknown format'}
                                <span className="visually-hidden">,</span>
                              </dd>
                            </div>

                            <div className="ds_metadata__item">
                              <dt className="ds_metadata__key visually-hidden">File size</dt>
                              <dd className="ds_metadata__value">
                                {(resource.size / 1024).toFixed(2)} KB
                              </dd>
                            </div>

                            <div className="ds_metadata__item">
                              <dt className="ds_metadata__key visually-hidden">Date Created</dt>
                              <dd className="ds_metadata__value">
                                {format(new Date(resource.created), 'dd MMMM yyyy')}
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </div>

                      <div className="ds_button-group">
                        <a
                          href={resource.url}
                          className="ds_button ds_button--download"
                          download
                        >
                          Download
                        </a>
                        {['csv', 'geojson'].includes(resource.format.toLowerCase()) && (
                          <a
                            href={`/dataset/${dataset.id}/explore/${resource.id}`} // Add resource ID to URL
                            className="ds_button ds_button--secondary"
                          >
                            {resource.format.toUpperCase() === 'GEOJSON' ? 'Explore Data' : 'Explore Data'}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dataset;
