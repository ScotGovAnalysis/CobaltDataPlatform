import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Datasets = () => {
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        // Fetch all datasets from CKAN, using the package_search API without a query to get all results
        const response = await fetch(`/api/3/action/package_search?q=&rows=1000`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setDatasets(data.result.results);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchDatasets();
  }, []);

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading datasets...</p>
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
        <div className="ds_layout ds_layout--article">
          <div className="ds_layout__content">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">Datasets</h1>
              <p className="ds_page-header__subtitle">
                {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} found
              </p>
            </header>

            <ol className="ds_search-results__list">
              {datasets.map((dataset) => (
                <li key={dataset.id} className="ds_search-result">
                  <h2 className="ds_search-result__title">
                    <Link 
                      to={`/dataset/${dataset.name}`} 
                      className="ds_search-result__link"
                    >
                      {dataset.title}
                    </Link>
                  </h2>
                  <p className="ds_search-result__summary">
                    {dataset.notes || 'No description available'}
                  </p>
                  <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                    <div className="ds_metadata__item">
                      <dt className="ds_metadata__key">Organization</dt>
                      <dd className="ds_metadata__value">
                        {dataset.organization?.title || 'Unknown'}
                      </dd>
                    </div>
                    {dataset.resources && dataset.resources.length > 0 && (
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Resource Types</dt>
                        <dd className="ds_metadata__value">
                          {dataset.resources.map(resource => resource.format).join(', ')}
                        </dd>
                      </div>
                    )}
                  </dl>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Datasets;