import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';

const Organisations = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Organisations";
  }, []); 
  
  const [organisations, setOrganisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    isActive: false,
    hasDatasets: false,
  });

  useEffect(() => {
    const fetchOrganisations = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/3/action/organization_list`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            all_fields: true,
            include_dataset_count: true,
            include_users: true,
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

  const handleFilterChange = (filter) => {
    setSelectedFilters((prevFilters) => ({
      ...prevFilters,
      [filter]: !prevFilters[filter],
    }));
  };

  const filteredOrganisations = organisations.filter(org => {
    const isActive = selectedFilters.isActive ? org.state === 'active' : true;
    const hasDatasets = selectedFilters.hasDatasets ? org.package_count > 0 : true;
    return isActive && hasDatasets;
  });
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
            <p>Error: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main className="ds_layout ds_layout--search-results--filters">
          <div className="ds_layout__header">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">Organisations</h1>
            </header>
          </div>
          <div className="ds_layout__content">
            <div className="ds_site-search">
              <form action="/organisations" role="search" className="ds_site-search__form" method="GET">
                <label className="ds_label visually-hidden" htmlFor="site-search">Search</label>
                <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                  <input
                    name="q"
                    required
                    id="site-search"
                    className="ds_input ds_site-search__input"
                    type="search"
                    placeholder="Search"
                    autoComplete="off"
                  />
                  <button type="submit" className="ds_button js-site-search-button">
                    <span className="visually-hidden">Search</span>
                    <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <div className="ds_details ds_no-margin" data-module="ds-details">
                <input id="filters-toggle" type="checkbox" className="ds_details__toggle visually-hidden" />
                <label htmlFor="filters-toggle" className="ds_details__summary">
                  Search filters
                </label>
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
                    </li>
                  </ul>
                </div>
                <div className="ds_details__text">
                  <form id="filters">
                    <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                    <div className="ds_accordion ds_accordion--small ds_!_margin-top--0" data-module="ds-accordion">
                      {/* Is Active Filter */}
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="is-active-panel"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Is Active
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label
                            className="ds_accordion-item__label"
                            htmlFor="is-active-panel"
                          >
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">Select active organisations</legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                <div className="ds_checkbox ds_checkbox--small">
                                  <input
                                    id="is-active"
                                    type="checkbox"
                                    className="ds_checkbox__input"
                                    checked={selectedFilters.isActive}
                                    onChange={() => handleFilterChange('isActive')}
                                  />
                                  <label htmlFor="is-active" className="ds_checkbox__label">
                                    Active Organisations
                                  </label>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                      {/* Has Datasets Filter */}
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="has-datasets-panel"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Has Datasets
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label
                            className="ds_accordion-item__label"
                            htmlFor="has-datasets-panel"
                          >
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">Select organisations with datasets</legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                <div className="ds_checkbox ds_checkbox--small">
                                  <input
                                    id="has-datasets"
                                    type="checkbox"
                                    className="ds_checkbox__input"
                                    checked={selectedFilters.hasDatasets}
                                    onChange={() => handleFilterChange('hasDatasets')}
                                  />
                                  <label htmlFor="has-datasets" className="ds_checkbox__label">
                                    Organisations with Datasets
                                  </label>
                                </div>
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="ds_button ds_button--primary ds_button--small ds_button--max ds_no-margin">
                      Apply filter
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div className="ds_layout__list">
            <div className="ds_search-results">
              <h2 aria-live="polite" className="ds_search-results__title">
                {filteredOrganisations.length} Organisation{filteredOrganisations.length !== 1 ? 's' : ''} found
              </h2>
              <ol className="ds_search-results__list" data-total={filteredOrganisations.length} start="1">
                {filteredOrganisations.map((org) => (
                  <li key={org.id} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link to={`/organisation/${org.name}`} className="ds_search-result__link">
                        {org.title || org.name}
                      </Link>
                    </h3>
                    <p className="ds_search-result__summary">
                      {org.description || 'No description available'}
                    </p>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Datasets</dt>
                        <dd className="ds_metadata__value">{org.package_count || 0} Datasets Published</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            </div>
            <BackToTop />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Organisations;
