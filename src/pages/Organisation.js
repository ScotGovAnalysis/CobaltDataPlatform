import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Organisation = () => {
  const { OrganisationId } = useParams(); // Get the Organisation ID from the URL
  const [Organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch Organisation details from CKAN API
  useEffect(() => {
    const fetchOrganisationDetails = async () => {
      try {
        const response = await fetch('/api/3/action/organization_show', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'Organisation_show', // CKAN API action
            id: OrganisationId, // Organisation ID from the URL
            include_datasets: true, // Include datasets in the response
            include_users: true, // Include users in the response
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch Organisation details');
        }

        const data = await response.json();

        if (!data.result) {
          throw new Error('Organisation not found');
        }

        setOrganisation(data.result);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrganisationDetails();
  }, [OrganisationId]);

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading Organisation details...</p>
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
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!Organisation) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_error">
            <p>Organisation not found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <div className="ds_layout">
          {/* Main Content */}
          <div className="ds_layout__content">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">{Organisation.title || Organisation.name}</h1>
              <p className="ds_page-header__subtitle">
                {Organisation.package_count || 0} dataset{Organisation.package_count !== 1 ? 's' : ''} found
              </p>
            </header>

            {/* Organisation Description */}
            <section className="ds_section">
              <h2 className="ds_section__title">Description</h2>
              <p className="ds_section__content">
                {Organisation.description || 'No description available.'}
              </p>
            </section>

            {/* Datasets Section */}
            <section className="ds_section">
              <h2 className="ds_section__title">Datasets</h2>
              {Organisation.packages && Organisation.packages.length > 0 ? (
                <ul className="ds_search-results__list">
                  {Organisation.packages.map((dataset) => (
                    <li key={dataset.id} className="ds_search-result">
                      <h3 className="ds_search-result__title">
                        <Link
                          to={`/dataset/${dataset.name}`}
                          className="ds_search-result__link"
                        >
                          {dataset.title || dataset.name}
                        </Link>
                      </h3>
                      <p className="ds_search-result__summary">
                        {dataset.notes || 'No description available.'}
                      </p>
                      <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                        <div className="ds_metadata__item">
                          <dt className="ds_metadata__key">Format</dt>
                          <dd className="ds_metadata__value">
                            {dataset.resources && dataset.resources.length > 0
                              ? dataset.resources[0].format
                              : 'N/A'}
                          </dd>
                        </div>
                        <div className="ds_metadata__item">
                          <dt className="ds_metadata__key">Last Updated</dt>
                          <dd className="ds_metadata__value">
                            {dataset.metadata_modified || 'N/A'}
                          </dd>
                        </div>
                      </dl>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No datasets found for this Organisation.</p>
              )}
            </section>

            {/* Members Section */}
            <section className="ds_section">
              <h2 className="ds_section__title">Members</h2>
              {Organisation.users && Organisation.users.length > 0 ? (
                <ul className="ds_list">
                  {Organisation.users.map((user) => (
                    <li key={user.id} className="ds_list__item">
                      <span className="ds_list__value">{user.name}</span>
                      <span className="ds_list__label">{user.capacity}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No members found for this Organisation.</p>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organisation;