import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import '@scottish-government/design-system/dist/scripts/design-system.js';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';

const Organisations = () => {
  useEffect(() => {
    document.title = 'Cobalt | Organisations';
    window.DS.initAll(); // Initialize all Design System components
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [organisations, setOrganisations] = useState([]);
  const [filteredOrganisations, setFilteredOrganisations] = useState([]); // Separate state for filtered results
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({
    isActive: false,
    hasDatasets: false,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize to detect mobile view
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch organisations from API
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

        let filteredOrgs = data.result;
        if (searchQuery) {
          filteredOrgs = data.result.filter(
            (org) =>
              org.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              org.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setOrganisations(filteredOrgs);
        setFilteredOrganisations(filteredOrgs); // Initialize filteredOrganisations
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };

    fetchOrganisations();
  }, [searchQuery]);

  // Reinitialize Design System components after filter rendering
  useEffect(() => {
    window.DS.initAll();
  }, [isMobile, selectedFilters]);

  // Handle filter checkbox changes
  const handleFilterChange = useCallback(
    (filter) => {
      setSelectedFilters((prevFilters) => ({
        ...prevFilters,
        [filter]: !prevFilters[filter],
      }));

      // Auto-apply filters on desktop
      if (!isMobile) {
        const newFilters = {
          ...selectedFilters,
          [filter]: !selectedFilters[filter],
        };
        applyFilters(newFilters);
      }
    },
    [selectedFilters, isMobile]
  );

  // Apply filters to organisations
  const applyFilters = useCallback(
    (filters) => {
      const filteredOrgs = organisations.filter((org) => {
        const isActive = filters.isActive ? org.state === 'active' : true;
        const hasDatasets = filters.hasDatasets ? org.package_count > 0 : true;
        return isActive && hasDatasets;
      });
      setFilteredOrganisations(filteredOrgs);
    },
    [organisations]
  );

  // Handle "Apply filter" button on mobile
  const handleApplyFilters = () => {
    applyFilters(selectedFilters);
  };

  // Handle sorting
  const handleSortChange = (sortBy) => {
    let sortedOrganisations = [...filteredOrganisations];
    if (sortBy === 'date') {
      sortedOrganisations.sort((a, b) => new Date(b.metadata_modified) - new Date(a.metadata_modified));
    } else if (sortBy === 'adate') {
      sortedOrganisations.sort((a, b) => new Date(a.metadata_modified) - new Date(b.metadata_modified));
    }
    setFilteredOrganisations(sortedOrganisations);
  };

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div
          className="ds_wrapper"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
          <PropagateLoader color="#0065bd" loading={true} speedMultiplier={1} />
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
    <main className="ds_layout ds_layout--search-results--filters">
      <div className="ds_layout__header">
        <header className="ds_page-header">
          <h1 className="ds_page-header__title">Search</h1>
        </header>
      </div>
      <div className="ds_layout__content">
        <div className="ds_site-search">
          <form role="search" className="ds_site-search__form">
            <label className="ds_label visually-hidden" htmlFor="site-search">
              Search
            </label>
            <div className="ds_input__wrapper ds_input__wrapper--has-icon">
              <input
                name="q"
                required
                id="site-search"
                className="ds_input ds_site-search__input"
                type="search"
                placeholder="Search"
                autoComplete="off"
                defaultValue={searchQuery || ''}
              />
              <button type="submit" className="ds_button js-site-search-button">
                <span className="visually-hidden">Search</span>
                <svg className="ds_icon" aria-hidden="true" role="img">
                  <use href="/assets/images/icons/icons.stack.svg#search"></use>
                </svg>
              </button>
            </div>
          </form>
        </div>
        {/* Mobile Filters */}
        {isMobile && (
          <div className="ds_search-filters ds_search-filters--mobile">
            <div className="ds_details ds_no-margin" data-module="ds-details">
              <input
                id="filters-toggle"
                type="checkbox"
                className="ds_details__toggle visually-hidden"
              />
              <label htmlFor="filters-toggle" className="ds_details__summary">
                Search filters
              </label>
              <div className="ds_details__text">
                <form id="filters">
                  <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                  <div
                    className="ds_accordion ds_accordion--small ds_!_margin-top--0"
                    data-module="ds-accordion"
                  >
                    {/* Is Active Filter */}
                    <div className="ds_accordion-item">
                      <input
                        type="checkbox"
                        className="visually-hidden ds_accordion-item__control"
                        id="is-active-panel"
                      />
                      <div className="ds_accordion-item__header">
                        <h3 className="ds_accordion-item__title">
                          Is Active
                          {selectedFilters.isActive && (
                            <div className="ds_search-filters__filter-count">
                              (1 selected)
                            </div>
                          )}
                        </h3>
                        <span>
  <svg className="ds_icon" aria-hidden="true" role="img">
    <use href="/assets/images/icons/icons.stack.svg#chevron_left"></use>
  </svg>
</span>                        <label
                          className="ds_accordion-item__label"
                          htmlFor="is-active-panel"
                        >
                          <span className="visually-hidden">Show this section</span>
                        </label>
                      </div>
                      <div className="ds_accordion-item__body">
                        <fieldset>
                          <legend className="visually-hidden">
                            Select active organisations
                          </legend>
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
                                <label
                                  htmlFor="is-active"
                                  className="ds_checkbox__label"
                                >
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
                        className="visually-hidden ds_accordion-item__control"
                        id="has-datasets-panel"
                      />
                      <div className="ds_accordion-item__header">
                        <h3 className="ds_accordion-item__title">
                          Has Datasets
                          {selectedFilters.hasDatasets && (
                            <div className="ds_search-filters__filter-count">
                              (1 selected)
                            </div>
                          )}
                        </h3>
                        <span className="ds_accordion-item__indicator"></span>
                        <label
                          className="ds_accordion-item__label"
                          htmlFor="has-datasets-panel"
                        >
                          <span className="visually-hidden">Show this section</span>
                        </label>
                      </div>
                      <div className="ds_accordion-item__body">
                        <fieldset>
                          <legend className="visually-hidden">
                            Select organisations with datasets
                          </legend>
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
                                <label
                                  htmlFor="has-datasets"
                                  className="ds_checkbox__label"
                                >
                                  Organisations with Datasets
                                </label>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="ds_button ds_button--primary ds_button--small ds_button--max ds_no-margin"
                    onClick={handleApplyFilters}
                  >
                    Apply filter
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Sidebar for Desktop */}
      {!isMobile && (
        <div className="ds_layout__sidebar">
          <div className="ds_search-filters">
            <div className="ds_details ds_no-margin" data-module="ds-details">
              <input
                id="filters-toggle-desktop"
                type="checkbox"
                className="ds_details__toggle visually-hidden"
              />
              <label
                htmlFor="filters-toggle-desktop"
                className="ds_details__summary"
              >
                Search filters
              </label>
              <div className="ds_skip-links ds_skip-links--static">
                <ul className="ds_skip-links__list">
                  <li className="ds_skip-links__item">
                    <a className="ds_skip-links__link" href="#search-results">
                      Skip to results
                    </a>
                  </li>
                </ul>
              </div>
              <div className="ds_details__text">
                <form id="filters-desktop">
                  <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                  <div
                    className="ds_accordion ds_accordion--small ds_!_margin-top--0"
                    data-module="ds-accordion"
                  >
                    <div className="ds_accordion-item">
                      <input
                        type="checkbox"
                        className="visually-hidden ds_accordion-item__control"
                        id="is-active-panel-desktop"
                      />
                      <div className="ds_accordion-item__header">
                        <h3 className="ds_accordion-item__title">
                          Is Active
                          {selectedFilters.isActive && (
                            <div className="ds_search-filters__filter-count">
                              (1 selected)
                            </div>
                          )}
                        </h3>
                        <span className="ds_accordion-item__indicator"></span>
                        <label
                          className="ds_accordion-item__label"
                          htmlFor="is-active-panel-desktop"
                        >
                          <span className="visually-hidden">Show this section</span>
                        </label>
                      </div>
                      <div className="ds_accordion-item__body">
                        <fieldset>
                          <legend className="visually-hidden">
                            Select active organisations
                          </legend>
                          <div className="ds_search-filters__slides">
                            <div className="ds_search-filters__checkboxes">
                              <div className="ds_checkbox ds_checkbox--small">
                                <input
                                  id="is-active-desktop"
                                  type="checkbox"
                                  className="ds_checkbox__input"
                                  checked={selectedFilters.isActive}
                                  onChange={() => handleFilterChange('isActive')}
                                />
                                <label
                                  htmlFor="is-active-desktop"
                                  className="ds_checkbox__label"
                                >
                                  Active Organisations
                                </label>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                    <div className="ds_accordion-item">
                      <input
                        type="checkbox"
                        className="visually-hidden ds_accordion-item__control"
                        id="has-datasets-panel-desktop"
                      />
                      <div className="ds_accordion-item__header">
                        <h3 className="ds_accordion-item__title">
                          Has Datasets
                          {selectedFilters.hasDatasets && (
                            <div className="ds_search-filters__filter-count">
                              (1 selected)
                            </div>
                          )}
                        </h3>
                        <span className="ds_accordion-item__indicator"></span>
                        <label
                          className="ds_accordion-item__label"
                          htmlFor="has-datasets-panel-desktop"
                        >
                          <span className="visually-hidden">Show this section</span>
                        </label>
                      </div>
                      <div className="ds_accordion-item__body">
                        <fieldset>
                          <legend className="visually-hidden">
                            Select organisations with datasets
                          </legend>
                          <div className="ds_search-filters__scrollable">
                            <div className="ds_search-filters__checkboxes">
                              <div className="ds_checkbox ds_checkbox--small">
                                <input
                                  id="has-datasets-desktop"
                                  type="checkbox"
                                  className="ds_checkbox__input"
                                  checked={selectedFilters.hasDatasets}
                                  onChange={() => handleFilterChange('hasDatasets')}
                                />
                                <label
                                  htmlFor="has-datasets-desktop"
                                  className="ds_checkbox__label"
                                >
                                  Organisations with Datasets
                                </label>
                              </div>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="ds_layout__list">
        <div className="ds_search-results">
          {/* Search Suggestions */}
          {searchQuery && (
            <nav
              className="ds_search-suggestions"
              aria-label="Alternative search suggestions"
            >
              <h2 className="visually-hidden">
                Also showing results for {searchQuery}
              </h2>
              <p>
                <span aria-hidden="true">Also showing results for</span>{' '}
                <a
                  aria-label={`Show results only for ${searchQuery}`}
                  href={`?q=${encodeURIComponent(searchQuery)}&page=1`}
                  data-search="suggestion-result-1/1"
                >
                  {searchQuery}
                </a>
              </p>
            </nav>
          )}
          <h2 aria-live="polite" className="ds_search-results__title">
            {filteredOrganisations.length}{' '}
            {searchQuery
              ? `result${filteredOrganisations.length !== 1 ? 's' : ''} for "${searchQuery}"`
              : `Organisation${filteredOrganisations.length !== 1 ? 's' : ''}`}
          </h2>
          <div className="ds_search-controls">
            <div className="ds_skip-links ds_skip-links--static">
              <ul className="ds_skip-links__list">
                <li className="ds_skip-links__item">
                  <a
                    className="ds_skip-links__link"
                    href="#search-results"
                    data-section={`${filteredOrganisations.length} results for ${searchQuery || 'Organisations'}`}
                    data-navigation="skip-link-2"
                  >
                    Skip to results
                  </a>
                </li>
              </ul>
            </div>
            <div className="ds_facets">
              <p className="visually-hidden">
                There are{' '}
                {(selectedFilters.isActive ? 1 : 0) +
                  (selectedFilters.hasDatasets ? 1 : 0)}{' '}
                search filters applied
              </p>
              <dl className="ds_facets__list">
                {selectedFilters.isActive && (
                  <div className="ds_facet-group">
                    <dt className="ds_facet__group-title">Is Active:</dt>
                    <dd className="ds_facet-wrapper">
                      <span className="ds_facet">
                        Active Organisations
                        <button
                          type="button"
                          aria-label="Remove 'Active Organisations' filter"
                          className="ds_facet__button"
                          data-button="button-filter-isActive-remove"
                          onClick={() => handleFilterChange('isActive')}
                        >
                          <svg
                            className="ds_facet__button-icon"
                            aria-hidden="true"
                            role="img"
                            focusable="false"
                          >
                            <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                          </svg>
                        </button>
                      </span>
                    </dd>
                  </div>
                )}
                {selectedFilters.hasDatasets && (
                  <div className="ds_facet-group">
                    <dt className="ds_facet__group-title">Has Datasets:</dt>
                    <dd className="ds_facet-wrapper">
                      <span className="ds_facet">
                        Organisations with Datasets
                        <button
                          type="button"
                          aria-label="Remove 'Organisations with Datasets' filter"
                          className="ds_facet__button"
                          data-button="button-filter-hasDatasets-remove"
                          onClick={() => handleFilterChange('hasDatasets')}
                        >
                          <svg
                            className="ds_facet__button-icon"
                            aria-hidden="true"
                            role="img"
                            focusable="false"
                          >
                            <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                          </svg>
                        </button>
                      </span>
                    </dd>
                  </div>
                )}
              </dl>
              {(selectedFilters.isActive || selectedFilters.hasDatasets) && (
                <button
                  className="ds_facets__clear-button ds_button ds_button--secondary"
                  data-button="button-clear-all-filters"
                  onClick={() => {
                    setSelectedFilters({ isActive: false, hasDatasets: false });
                    setFilteredOrganisations(organisations);
                  }}
                >
                  Clear all filters
                  <svg
                    className="ds_facet__button-icon"
                    aria-hidden="true"
                    role="img"
                    focusable="false"
                  >
                    <use href="/assets/images/icons/icons.stack.svg#cancel"></use>
                  </svg>
                </button>
              )}
            </div>
            <hr className="ds_search-results__divider" />
            <div className="ds_sort-options">
              <label className="ds_label" htmlFor="sort-by">
                Sort by
              </label>
              <span className="ds_select-wrapper">
                <select
                  className="ds_select js-has-tracking-event"
                  id="sort-by"
                  data-form="select-sort-by"
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="relevance" data-form="select-sort-by-relevance">
                    Most relevant
                  </option>
                  <option value="date" data-form="select-sort-by-date">
                    Updated (newest)
                  </option>
                  <option value="adate" data-form="select-sort-by-adate">
                    Updated (oldest)
                  </option>
                </select>
                <span className="ds_select-arrow" aria-hidden="true"></span>
              </span>
              <button
                form="filters"
                className="ds_button ds_button--secondary ds_button--small"
                type="submit"
                data-button="button-apply-sort"
              >
                Apply sort
              </button>
            </div>
          </div>
          <ol
            className="ds_search-results__list"
            id="search-results"
            data-total={filteredOrganisations.length}
            start="1"
          >
            {filteredOrganisations.map((org, index) => (
              <li key={org.id} className="ds_search-result">
                <h3 className="ds_search-result__title">
                  <Link
                    to={`/organisation/${org.name}`}
                    className="ds_search-result__link"
                    data-section={`${filteredOrganisations.length} results for ${searchQuery || 'Organisations'}`}
                    data-search={`search-result-${index + 1}/${filteredOrganisations.length}`}
                  >
                    {org.title || org.name}
                  </Link>
                </h3>
                <p className="ds_search-result__summary">
                  {(() => {
                    const text = org.description || 'No description available';
                    const words = text.split(' ');
                    return words.length > 65
                      ? words.slice(0, 65).join(' ') + '...'
                      : text;
                  })()}
                </p>
                <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Datasets</dt>
                    <dd className="ds_metadata__value">
                      {org.package_count || 0}{' '}
                      {org.package_count === 1 ? 'Dataset' : 'Datasets'} Published
                    </dd>
                  </div>
                </dl>
              </li>
            ))}
          </ol>
          <nav className="ds_pagination" aria-label="Search result pages">
            <ul className="ds_pagination__list">
              <li className="ds_pagination__item">
                <a
                  aria-label="Page 1"
                  aria-current="page"
                  className="ds_pagination__link ds_current"
                  href="#"
                  data-search="pagination-1"
                >
                  <span className="ds_pagination__link-label">1</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
      <BackToTop />
    </main>
  );
};

export default Organisations;
