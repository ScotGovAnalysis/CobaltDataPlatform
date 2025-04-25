import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import { PropagateLoader } from 'react-spinners';
import BackToTop from '../components/BackToTop';
const Theme = () => {
  const { themeName } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [group, setGroup] = useState(null);
  const [datasets, setDatasets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [resourceTypeOptions, setResourceTypeOptions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch group details without datasets
        const groupResponse = await fetch(
          `${config.apiBaseUrl}/api/3/action/group_show?id=${themeName}`
        );
        if (!groupResponse.ok) throw new Error('Failed to fetch group details');
        const groupData = await groupResponse.json();
        setGroup(groupData.result);

        // Fetch datasets separately with full details including tags
        const datasetsResponse = await fetch(
          `${config.apiBaseUrl}/api/3/action/package_search?q=groups:${themeName}&rows=1000`
        );
        if (!datasetsResponse.ok) throw new Error('Failed to fetch datasets');
        const datasetsData = await datasetsResponse.json();

        let fetchedDatasets = datasetsData.result.results || [];
        if (searchQuery) {
          fetchedDatasets = fetchedDatasets.filter(dataset =>
            dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dataset.notes?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setDatasets(fetchedDatasets);

        // Extract unique organizations
        const uniqueOrgs = Array.from(
          new Set(
            fetchedDatasets
              .map(dataset => dataset.organization?.title)
              .filter(org => org)
          )
        );
        setOrganizationOptions(uniqueOrgs);

        // Extract unique resource formats
        const uniqueFormats = Array.from(
          new Set(
            fetchedDatasets
              .flatMap(dataset =>
                dataset.resources
                  ? dataset.resources.map(resource => resource.format)
                  : []
              )
              .filter(format => format)
          )
        );
        setResourceTypeOptions(uniqueFormats);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [themeName, searchQuery]);

  useEffect(() => {
    if (group) {
      document.title = `Cobalt | ${group.display_name}`;
    } else {
      document.title = "Cobalt | Theme";
    }
  }, [group]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleOrganizationFilter = (org) => {
    setSelectedOrganizations(prev =>
      prev.includes(org)
        ? prev.filter(item => item !== org)
        : [...prev, org]
    );
  };

  const handleResourceTypeFilter = (type) => {
    setSelectedResourceTypes(prev =>
      prev.includes(type)
        ? prev.filter(item => item !== type)
        : [...prev, type]
    );
  };

  const filteredDatasets = datasets
    .filter(dataset => {
      const orgMatch =
        selectedOrganizations.length === 0 ||
        selectedOrganizations.includes(dataset.organization?.title);
      const resourceMatch =
        selectedResourceTypes.length === 0 ||
        (dataset.resources &&
          dataset.resources.some(resource =>
            selectedResourceTypes.includes(resource.format)
          ));
      return orgMatch && resourceMatch;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.metadata_modified) - new Date(a.metadata_modified);
      } else if (sortBy === 'adate') {
        return new Date(a.metadata_modified) - new Date(b.metadata_modified);
      }
      return 0; // relevance remains unchanged
    });

  const getOrganizationCounts = () => {
    return organizationOptions.map(org => ({
      name: org,
      count: datasets.filter(
        dataset => dataset.organization?.title === org
      ).length || 0,
    }));
  };

  const getResourceTypeCounts = () => {
    return resourceTypeOptions.map(format => ({
      name: format,
      count: datasets.filter(
        dataset =>
          dataset.resources &&
          dataset.resources.some(resource => resource.format === format)
      ).length || 0,
    }));
  };

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div
          className="ds_wrapper"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
        >
          <PropagateLoader
            color="#0065bd"
            loading={true}
            speedMultiplier={1}
          />
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
        <main className="ds_layout ds_layout--search-results--filters">
          <div className="ds_layout__header">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">
                {searchQuery ? `Search results for "${searchQuery}" in ${group.display_name}` : group.display_name}
              </h1>
            </header>
          </div>
          <div className="ds_layout__content"></div>
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h3 className="ds_search-filters__title ds_h4">Search</h3>
              <div className="ds_site-search">
                <form action={`/theme/${group.name}`} role="search" className="ds_site-search__form" method="GET">
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
                      value={searchQuery || ''}
                    />
                    <button type="submit" className="ds_button js-site-search-button">
                      <span className="visually-hidden">Search</span>
                      <svg
                        className="ds_icon ds_icon--24"
                        aria-hidden="true"
                        role="img"
                        viewBox="0 0 24 24"
                      >
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                      </svg>
                    </button>
                  </div>
                </form>
              </div>
              <div className="ds_details ds_no-margin" data-module="ds-details">
                <input id="filters-toggle" type="checkbox" className="ds_details__toggle visually-hidden" />
                <label htmlFor="filters-toggle" className="ds_details__summary">
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
                  <form id="filters">
                    <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                    <div
                      className="ds_accordion ds_accordion--small ds_!_margin-top--0"
                      data-module="ds-accordion"
                    >
                      {/* Organization Filter */}
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="organization-panel"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Organisation
                            {selectedOrganizations.length > 0 && (
                              <div className="ds_search-filters__filter-count">
                                ({selectedOrganizations.length} selected)
                              </div>
                            )}
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label
                            className="ds_accordion-item__label"
                            htmlFor="organization-panel"
                          >
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">
                              Select which organizations you would like to see
                            </legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                {getOrganizationCounts().map(org => (
                                  <div
                                    key={org.name}
                                    className="ds_checkbox ds_checkbox--small"
                                  >
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
                          </fieldset>
                        </div>
                      </div>
                      {/* Resource Type Filter */}
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="resource-panel"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Data Format
                            {selectedResourceTypes.length > 0 && (
                              <div className="ds_search-filters__filter-count">
                                ({selectedResourceTypes.length} selected)
                              </div>
                            )}
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label
                            className="ds_accordion-item__label"
                            htmlFor="resource-panel"
                          >
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">
                              Select which resource formats you would like to see
                            </legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                {getResourceTypeCounts().map(type => (
                                  <div
                                    key={type.name}
                                    className="ds_checkbox ds_checkbox--small"
                                  >
                                    <input
                                      id={`type-${type.name}`}
                                      type="checkbox"
                                      className="ds_checkbox__input"
                                      checked={selectedResourceTypes.includes(type.name)}
                                      onChange={() => handleResourceTypeFilter(type.name)}
                                    />
                                    <label
                                      htmlFor={`type-${type.name}`}
                                      className="ds_checkbox__label"
                                    >
                                      {type.name}
                                      <span className="badge ml-2"> ({type.count})</span>
                                    </label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </fieldset>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      className="ds_button ds_button--primary ds_button--small ds_button--max ds_no-margin"
                    >
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
                {filteredDatasets.length} {searchQuery ? `result${filteredDatasets.length !== 1 ? 's' : ''} for "${searchQuery}"` : `dataset${filteredDatasets.length !== 1 ? 's' : ''}`} in {group.display_name}
              </h2>
              <hr className="ds_search-results__divider" />
              <div className="ds_search-controls">
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">
                        Skip to results
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="ds_facets">
                  <p className="visually-hidden">
                    There are {selectedOrganizations.length + selectedResourceTypes.length} search filters applied
                  </p>
                  <dl className="ds_facets__list">
                    {selectedOrganizations.length > 0 && (
                      <div className="ds_facet-group">
                        <dt className="ds_facet__group-title">Organization:</dt>
                        {selectedOrganizations.map(org => (
                          <dd key={org} className="ds_facet-wrapper">
                            <span className="ds_facet">
                              {org}
                              <button
                                type="button"
                                aria-label={`Remove '${org}' filter`}
                                className="ds_facet__button"
                                onClick={() => handleOrganizationFilter(org)}
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
                        ))}
                      </div>
                    )}
                    {selectedResourceTypes.length > 0 && (
                      <div className="ds_facet-group">
                        <dt className="ds_facet__group-title">Data Format:</dt>
                        {selectedResourceTypes.map(type => (
                          <dd key={type} className="ds_facet-wrapper">
                            <span className="ds_facet">
                              {type}
                              <button
                                type="button"
                                aria-label={`Remove '${type}' filter`}
                                className="ds_facet__button"
                                onClick={() => handleResourceTypeFilter(type)}
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
                        ))}
                      </div>
                    )}
                  </dl>
                  {(selectedOrganizations.length > 0 || selectedResourceTypes.length > 0) && (
                    <button
                      className="ds_facets__clear-button ds_button ds_button--secondary"
                      onClick={() => {
                        setSelectedOrganizations([]);
                        setSelectedResourceTypes([]);
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
                <div className="ds_sort-options">
                  <label className="ds_label" htmlFor="sort-by">
                    Sort by
                  </label>
                  <span className={`ds_select-wrapper ${styles.selectWrapper}`}>
                    <select
                      className={`ds_select ${styles.select}`}
                      id="sort-by"
                      value={sortBy}
                      onChange={handleSortChange}
                    >
                      <option value="relevance">Most relevant</option>
                      <option value="date">Updated (newest)</option>
                      <option value="adate">Updated (oldest)</option>
                    </select>
                    <span
                      className={`ds_select-arrow ${styles.selectArrow}`}
                      aria-hidden="true"
                    ></span>
                  </span>
                </div>
              </div>
              <ol
                className="ds_search-results__list"
                data-total={filteredDatasets.length}
                start="1"
              >
                {filteredDatasets.map(dataset => (
                  <li key={dataset.id} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link
                        to={{
                          pathname: `/dataset/${dataset.name}`,
                          state: { fromResults: true, searchQuery: searchQuery },
                        }}
                        className="ds_search-result__link"
                      >
                        {dataset.title}
                      </Link>
                    </h3>
                    <p className="ds_search-result__summary">
                      {(() => {
                        const text = dataset.notes || 'No description available';
                        const words = text.split(' ');
                        return words.length > 65
                          ? words.slice(0, 65).join(' ') + '...'
                          : text;
                      })()}
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
                            {[...new Set(dataset.resources.map(resource => resource.format))].join(
                              ', '
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Last Updated</dt>
                        <dd className="ds_metadata__value">
                          Last updated:{' '}
                          {new Date(dataset.metadata_modified).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                    {dataset.tags && dataset.tags.length > 0 && (
                      <div className={styles.sgTagList} style={{ marginTop: '0.75rem' }}>
                        {dataset.tags.map((tag, index) => (
                          <Link
                            key={index}
                            to={`/results?q=${encodeURIComponent(tag.name)}`}
                            className={styles.sgTag}
                          >
                            {tag.name}
                          </Link>
                        ))}
                      </div>
                    )}
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
                    >
                      <span className="ds_pagination__link-label">1</span>
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </main>
      </div>
      <BackToTop />

    </div>
  );
};

export default Theme;
