import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Organisations = () => {
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch organisations from CKAN API
  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await fetch('/api/3/action/organization_list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            all_fields: true, // Fetch all fields for organisations
            include_dataset_count: true, // Include dataset count
            include_users: true, // Include users
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch organisations');
        }

        const data = await response.json();

        if (!data.result) {
          throw new Error('No organisations found');
        }

        setOrganisations(data.result);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, []);

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading organisations...</p>
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

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <div className="ds_layout ds_layout--search-results--filters">
          {/* Sidebar with Filters (LEFT SIDE) */}
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h2 className="ds_search-filters__title">Filters</h2>
              
              {/* Example Filter: organisation Type */}
              <div className="ds_accordion ds_accordion--small">
                <div className="ds_accordion-item">
                  <input 
                    type="checkbox" 
                    className="visually-hidden ds_accordion-item__control" 
                    id="organisation-type-panel"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">organisation Type</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label 
                      className="ds_accordion-item__label" 
                      htmlFor="organisation-type-panel"
                    >
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <div className="ds_search-filters__checkboxes">
                      <div className="ds_checkbox ds_checkbox--small">
                        <input
                          id="type-government"
                          type="checkbox"
                          className="ds_checkbox__input"
                        />
                        <label htmlFor="type-government" className="ds_checkbox__label">
                          Government
                        </label>
                      </div>
                      <div className="ds_checkbox ds_checkbox--small">
                        <input
                          id="type-non-profit"
                          type="checkbox"
                          className="ds_checkbox__input"
                        />
                        <label htmlFor="type-non-profit" className="ds_checkbox__label">
                          Non-Profit
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content (RIGHT SIDE) */}
          <div className="ds_layout__content">
            <div className="ds_search-results">
              <header className="ds_page-header">
                <h1 className="ds_page-header__title">Organisations</h1>
                <p className="ds_page-header__subtitle">
                  {organisations.length} Organisation{organisations.length !== 1 ? 's' : ''} found
                </p>
              </header>

              {/* Search Bar */}
              <form className="ds_search-form" action="/organisation/" method="get">
                <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                  <input
                    type="search"
                    name="q"
                    className="ds_input"
                    placeholder="Search organisations..."
                    aria-label="Search organisations"
                  />
                  <button className="ds_button ds_button--primary" type="submit" aria-label="Search">
                    <span className="visually-hidden">Search</span>
                    <svg className="ds_icon" aria-hidden="true" role="img">
                      <use href="/webfiles/1737555688374/assets/images/icons/icons.stack.svg#search"></use>
                    </svg>
                  </button>
                </div>
              </form>

              {/* organisations List */}
              <ul className="ds_search-results__list">
                {organisations.map((org) => (
                  <li key={org.id} className="ds_search-result">
                    <h2 className="ds_search-result__title">
                      <Link 
                        to={`/organisation/${org.name}`} 
                        className="ds_search-result__link"
                      >
                        {org.title || org.name}
                      </Link>
                    </h2>
                    <p className="ds_search-result__summary">
                      {org.description || 'No description available'}
                    </p>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Datasets</dt>
                        <dd className="ds_metadata__value">{org.package_count || 0}</dd>
                      </div>
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Members</dt>
                        <dd className="ds_metadata__value">{org.users ? org.users.length : 0}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Organisations;