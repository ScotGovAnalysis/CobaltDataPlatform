import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';

const Dataset = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasetDetails = async () => {
      try {
        const response = await fetch(`/api/3/action/package_show?id=${id}`);
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
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb">
          <ol className="ds_breadcrumbs">
            <li className="ds_breadcrumbs__item">
              <a className="ds_breadcrumbs__link" href="/">Home</a>
            </li>
            <li className="ds_breadcrumbs__item">
              <a className="ds_breadcrumbs__link" href="/datasets">Datasets</a>
            </li>
          </ol>
        </nav>
      </div>

      <div className="ds_wrapper">
        {/* Main Layout */}
        <main id="main-content">
          <header className="ds_page-header gov_sublayout gov_sublayout--publication-header">
            <div className="gov_sublayout__title">
              <span className="ds_page-header__label ds_content-label">Dataset</span>
              <h1 className="ds_page-header__title">{dataset.title}</h1>
            </div>

            <div className="gov_sublayout__metadata">
              <dl className="ds_page-header__metadata ds_metadata">
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Published</dt>
                  <dd className="ds_metadata__value"><strong>{format(new Date(dataset.metadata_created), 'dd MMMM yyyy')}</strong></dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Organization</dt>
                  <dd className="ds_metadata__value">
                    <a href="#" className="ds_link">
                      {dataset.organization?.title || 'Not specified'}
                    </a>
                  </dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">License</dt>
                  <dd className="ds_metadata__value">{dataset.license_title || 'Not specified'}</dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Last Modified</dt>
                  <dd className="ds_metadata__value">{format(new Date(dataset.metadata_modified), 'dd MMMM yyyy')}</dd>
                </div>
              </dl>
            </div>
          </header>

          <hr />

          <div className="ds_layout gov_layout--publication--no-sidebar">
            <div className="ds_layout__content">
              <div className="ds_content">
                {dataset.notes && (
                  <p className="ds_leader ds_no-margin--bottom">{dataset.notes}</p>
                )}

                <h2 className="ds_heading">Resources</h2>
                <ul className="ds_details-list">
                  {dataset.resources.map((resource, index) => (
                    <li key={index} className="ds_details-list__item ">
                      <div className="ds_details-list__header">
                        <h3 className="ds_heading--small">
                          {resource.name || `Resource ${index + 1}`}
                        </h3>
                        <a 
                          href={resource.url} 
                          className="ds_button ds_button--small"
                          download
                        >
                          <span className="ds_button__label">
                            Download {resource.format}
                          </span>
                        </a>
                      </div>
                      <div className="ds_details-list__content">
                        <p>
                          <strong>Size:</strong> {(resource.size / 1024).toFixed(2)} KB
                          <br />
                          <strong>Last Modified:</strong> {format(new Date(resource.last_modified), 'dd MMMM yyyy')}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dataset;
