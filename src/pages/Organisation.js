import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';

const Organisation = () => {

  const { organisationName } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);
  const [resourceTypeOptions, setResourceTypeOptions] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchOrganisationDetails = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/3/action/organization_show?id=${organisationName}&include_datasets=true&include_users=true`
        );
        if (!response.ok) throw new Error('Failed to fetch organisation details');
        const data = await response.json();
        let datasets = data.result.packages || [];
        if (searchQuery) {
          datasets = datasets.filter(dataset =>
            dataset.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            dataset.notes?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        data.result.packages = datasets;
        setOrganisation(data.result);

        // Dynamically extract unique resource formats
        const uniqueFormats = Array.from(
          new Set(
            datasets
              .flatMap(dataset =>
                dataset.resources
                  ? dataset.resources.map(resource => resource.format)
                  : []
              )
              .filter(format => format)
          )
        );
        setResourceTypeOptions(uniqueFormats);

        setFilteredResults(datasets);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchOrganisationDetails();
  }, [organisationName, searchQuery]);

  useEffect(() => {
    if (organisation) {
      document.title = `Cobalt | ${organisation.title}`;
    } else {
      document.title = "Cobalt | Organisation";
    }
  }, [organisation]);
  

  useEffect(() => {
    if (organisation && organisation.packages) {
      let sorted = [...organisation.packages];

      switch (sortBy) {
        case 'date':
          sorted.sort((a, b) => new Date(b.metadata_modified) - new Date(a.metadata_modified));
          break;
        case 'adate':
          sorted.sort((a, b) => new Date(a.metadata_modified) - new Date(b.metadata_modified));
          break;
        case 'relevance':
        default:
          break;
      }

      // Apply resource type filter
      const filtered = sorted.filter(dataset =>
        selectedResourceTypes.length === 0 ||
        (dataset.resources &&
          dataset.resources.some(resource =>
            selectedResourceTypes.includes(resource.format)
          ))
      );

      setFilteredResults(filtered);
    }
  }, [sortBy, selectedResourceTypes, organisation]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const handleResourceTypeFilter = (type) => {
    setSelectedResourceTypes(prev =>
      prev.includes(type)
        ? prev.filter(item => item !== type)
        : [...prev, type]
    );
  };

  const getResourceTypeCounts = () => {
    return resourceTypeOptions.map(format => ({
      name: format,
      count: organisation?.packages.filter(
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
            <svg className="ds_icon ds_icon--48" aria-hidden="true" role="img">
              <use href="/assets/images/icons/icons.stack.svg#warning"></use>
            </svg>
            <h3 className="ds_error__title">Error loading organisation</h3>
            <p>{error}</p>
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
            <nav aria-label="Breadcrumb">
              <ol className="ds_breadcrumbs">
                <li className={styles.ds_breadcrumbs__item}>
                  <Link className="ds_breadcrumbs__link" to="/">Home</Link>
                </li>
                <li className={styles.ds_breadcrumbs__item}>
                  <span className="ds_breadcrumbs__current">{organisation.title}</span>
                </li>
              </ol>
            </nav>
            <header className="ds_page-header ds_page-header--with-image"                       style= {{ marginBottom:'0px'}}
            >
              <div className="ds_organisation-header" >
                {organisation.image_url && (
                  <div className="ds_organisation-logo">
                    <img
                      src={organisation.image_url}
                      alt={`${organisation.title} logo`}
                      className="ds_organisation-logo__image"
                    />
                  </div>
                )}
                <div>
                  <h1 className="ds_page-header__title">
                    {searchQuery ? `Search results for "${searchQuery}" in ${organisation.title}` : organisation.title}
                  </h1>
                </div>
              </div>
            </header>
          </div>
          <div className="ds_layout__content"></div>
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
                      <a className="ds_skip-links__link" href="#search-results">
                        Skip to results
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="ds_details__text">
                </div>
              </div>
              <div className="ds_metadata__panel">
              <hr />

                <h3 className="ds_search-filters__title ds_h4">Organisation Details</h3>
                <dl className="ds_metadata ds_metadata--stacked">
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Established</dt>
                    <dd className="ds_metadata__value">
                    {' '}{new Date(organisation.created).toLocaleDateString('en-GB', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </dd>
                  </div>
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Status</dt>
                    <dd className="ds_metadata__value">
                      <span className={`ds_badge ${organisation.state === 'active' ? 'ds_badge--success' : ''}`}>
                      {' '}{organisation.state === 'active' ? 'Active' : organisation.state.charAt(0).toUpperCase() + organisation.state.slice(1).toLowerCase()}
                      </span>
                    </dd>
                  </div>
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Administrators</dt>
                    <dd className="ds_metadata__value">
                    {' '}{organisation.users?.map(user => (
                        <div key={user.id} className="ds_user-badge">
                          <span className="ds_user-badge__name">{user.display_name}</span>
                          <span className="ds_user-badge__role">{user.capacity}</span>
                        </div>
                      ))}
                    </dd>
                  </div>
                  <div className="ds_metadata__item">
                    <dt className="ds_metadata__key">Contact</dt>
                    <dd className="ds_metadata__value">
                    {' '}<a
                        href={`mailto:${organisation.packages?.[0]?.maintainer_email || 'N/A'}`}
                        className="ds_link"
                      >
                        Contact administrator
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
          <div className="ds_layout__list">
          <hr />

            <section className="ds_organisation-description">
              <h2 className="visually-hidden">About {organisation.title}</h2>
              <div className="ds_lead ds_!_margin-bottom--6">
                <p>{organisation.description || 'No description available'}</p>
              </div>
            </section>
            <div className="ds_search-results">
              <h2 aria-live="polite" className="ds_search-results__title">
                {filteredResults.length} {searchQuery ? `result${filteredResults.length !== 1 ? 's' : ''} for "${searchQuery}"` : `dataset${filteredResults.length !== 1 ? 's' : ''}`} in {organisation.title}
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
                    There are {selectedResourceTypes.length} search filters applied
                  </p>
                  <dl className="ds_facets__list">
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
                  {selectedResourceTypes.length > 0 && (
                    <button
                      className="ds_facets__clear-button ds_button ds_button--secondary"
                      onClick={() => setSelectedResourceTypes([])}
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
                  <label className="ds_label" htmlFor="sort-by">Sort by</label>
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
                data-total={filteredResults.length}
                start="1"
              >
                {filteredResults.map(result => (
                  <li key={result.id} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link
                        to={{
                          pathname: `/dataset/${result.name}`,
                          state: { fromResults: true, searchQuery: searchQuery },
                        }}
                        className="ds_search-result__link"
                      >
                        {result.title}
                      </Link>
                    </h3>
                    <p className="ds_search-result__summary">
                      {(() => {
                        const text = result.notes || 'No description available';
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
                          {result.organization?.title || organisation.title || 'Unknown'}
                        </dd>
                      </div>
                      {result.resources && result.resources.length > 0 && (
                        <div className="ds_metadata__item">
                          <dt className="ds_metadata__key">Resource Types</dt>
                          <dd className="ds_metadata__value">
                            {[...new Set(result.resources.map(resource => resource.format))].join(
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
                          {new Date(result.metadata_modified).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                    {result.tags && result.tags.length > 0 && (
                      <div className={styles.sgTagList} style={{ marginTop: '0.75rem' }}>
                        {result.tags.map((tag, index) => (
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

export default Organisation;