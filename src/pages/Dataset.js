import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';

const Dataset = () => {
  const { id } = useParams();
  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);

  const getThumbnailImage = (format) => {
    switch (format.toLowerCase()) {
      case 'csv':
        return '/documents/csv.svg';
      case 'pdf':
        return '/documents/pdf.svg';
      case 'excel':
        return '/documents/excel.svg';
      default:
        return '/documents/generic.svg';
    }
  };
  

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

  const handleOrganizationFilter = (orgName) => {
    setSelectedOrganizations((prev) =>
      prev.includes(orgName)
        ? prev.filter((org) => org !== orgName)
        : [...prev, orgName]
    );
  };

  const getOrganizationCounts = () => {
    // Example: Replace this with actual logic to count organizations
    return [
      { name: 'Organization A', count: 5 },
      { name: 'Organization B', count: 3 },
    ];
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
        <div className="ds_layout">
          {/* Sidebar for Filters */}
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h2 className="ds_search-filters__title">Filters</h2>

              {/* Organization Filter */}
              <div className="ds_accordion ds_accordion--small">
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className="visually-hidden ds_accordion-item__control"
                    id="organization-panel"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">Organization</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label
                      className="ds_accordion-item__label"
                      htmlFor="organization-panel"
                    >
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <div className="ds_search-filters__checkboxes">
                      {getOrganizationCounts().map((org) => (
                        <div key={org.name} className="ds_checkbox ds_checkbox--small">
                          <input
                            id={`org-${org.name}`}
                            type="checkbox"
                            className="ds_checkbox__input"
                            checked={selectedOrganizations.includes(org.name)}
                            onChange={() => handleOrganizationFilter(org.name)}
                          />
                          <label
                            htmlFor={`org-${org.name}`}
                            className="ds_checkbox__label"
                          >
                            {org.name}
                            <span className="badge ml-2"> ({org.count})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="ds_layout__content">
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
                      <dd className="ds_metadata__value">
                        <strong>{format(new Date(dataset.metadata_created), 'dd MMMM yyyy')}</strong>
                      </dd>
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
                      <dd className="ds_metadata__value">
                        {format(new Date(dataset.metadata_modified), 'dd MMMM yyyy')}
                      </dd>
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
                    <div className="ds_file-download-list">
                      {dataset.resources.map((resource, index) => (
                        <div key={index} className="ds_file-download">
                          <div className="ds_file-download__thumbnail">
                            <a
                              className="ds_file-download__thumbnail-link"
                              aria-hidden="true"
                              tabindex="-1"
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
                              </dl>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dataset;