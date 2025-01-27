import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { format } from 'date-fns';
import '../index.css';

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
      case 'xls':
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
        <div className="ds_layout gov_layout--publication--no-sidebar">
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
                        <strong> {format(new Date(dataset.metadata_created), 'dd MMMM yyyy')}</strong>
                      </dd>
                    </div>

                    <div className="ds_metadata__item">
                      <dt className="ds_metadata__key">Organisation</dt>
                      <dd className="ds_metadata__value"> &nbsp;
                        <a href="#" className="ds_link">
                           {dataset.organization?.title || 'Not specified'}
                        </a>
                      </dd>
                    </div>

                    <div className="ds_metadata__item">
                      <dt className="ds_metadata__key">License</dt>
                      <dd className="ds_metadata__value"> {dataset.license_title || 'Not specified'}</dd>
                    </div>

                    <div className="ds_metadata__item">
                      <dt className="ds_metadata__key">Last Modified</dt>
                      <dd className="ds_metadata__value">
                        {format(new Date(dataset.metadata_modified), ' dd MMMM yyyy')}
                      </dd>
                    </div>
                  </dl>
                </div>
              </header>

              <hr />

              {/* Description and Resources section */}
              <section>
                <h2>Description</h2>
                <p>{dataset.notes || 'No description available'}</p>
              </section>

              <section>
                <h2 className="ds_heading">Resources</h2>
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
                        {['csv', 'xls'].includes(resource.format.toLowerCase()) && (
                          <a 
                            href={`/dataset/${dataset.id}/explore`} 
                            className="ds_button ds_button--secondary"
                          >
                            Explore
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