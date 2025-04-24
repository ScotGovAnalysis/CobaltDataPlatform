import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import styles from '../styles/Design_Style.module.css';
import BackToTop from '../components/BackToTop';
import { PropagateLoader } from 'react-spinners';

const Themes = () => {
  useEffect(() => {
    document.title = "Cobalt | Themes";
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/3/action/group_list`);
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        const detailedGroups = await Promise.all(data.result.map(async (groupId) => {
          const groupResponse = await fetch(`${config.apiBaseUrl}/api/3/action/group_show?id=${groupId}`);
          if (!groupResponse.ok) {
            throw new Error(`Failed to fetch details for group ${groupId}`);
          }
          return await groupResponse.json();
        }));
        let filteredGroups = detailedGroups.map(group => group.result);
        if (searchQuery) {
          filteredGroups = filteredGroups.filter(group =>
            group.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            group.description?.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }
        setGroups(filteredGroups);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchGroups();
  }, [searchQuery]);

  if (loading) {
    return (
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
                {searchQuery ? `Search results for "${searchQuery}"` : 'Themes'}
              </h1>
            </header>
          </div>
          <div className="ds_layout__content">
          </div>
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h3 className="ds_search-filters__title ds_h4">Search</h3>
              <div className="ds_site-search">
                <form action="/themes" role="search" className="ds_site-search__form" method="GET">
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
                      <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24">
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
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
                    </li>
                  </ul>
                </div>
                <div className="ds_details__text">
                  <form id="filters">
                    <h3 className="ds_search-filters__title ds_h4">Filter by</h3>
                    <div className="ds_accordion ds_accordion--small ds_!_margin-top--0" data-module="ds-accordion">
                      <div className="ds_accordion-item">
                        <input
                          type="checkbox"
                          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                          id="theme-type-panel"
                        />
                        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                          <h3 className="ds_accordion-item__title">
                            Theme Type
                          </h3>
                          <span className={styles.accordionIndicator}></span>
                          <label
                            className="ds_accordion-item__label"
                            htmlFor="theme-type-panel"
                          >
                            <span className="visually-hidden">Show this section</span>
                          </label>
                        </div>
                        <div className="ds_accordion-item__body">
                          <fieldset>
                            <legend className="visually-hidden">Select which theme types you would like to see</legend>
                            <div className="ds_search-filters__scrollable">
                              <div className="ds_search-filters__checkboxes">
                                {/* Placeholder for future theme type filters */}
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
                {groups.length} {searchQuery ? `result${groups.length !== 1 ? 's' : ''} for "${searchQuery}"` : `categor${groups.length !== 1 ? 'ies' : 'y'}`}
              </h2>
              <hr className="ds_search-results__divider" />
              <div className="ds_search-controls">
                <div className="ds_skip-links ds_skip-links--static">
                  <ul className="ds_skip-links__list">
                    <li className="ds_skip-links__item">
                      <a className="ds_skip-links__link" href="#search-results">Skip to results</a>
                    </li>
                  </ul>
                </div>
                <div className="ds_facets">
                  <p className="visually-hidden">There are 0 search filters applied</p>
                  <dl className="ds_facets__list"></dl>
                </div>
              </div>
              <ol className="ds_search-results__list" data-total={groups.length} start="1">
                {groups.map((group) => (
                  <li key={group.id} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link to={`/theme/${group.name}`} className="ds_search-result__link">
                        {group.display_name}
                      </Link>
                    </h3>
                    <p className="ds_search-result__summary">
                      {(() => {
                        const text = group.description || 'No description available';
                        const words = text.split(' ');
                        return words.length > 65 ? words.slice(0, 65).join(' ') + '...' : text;
                      })()}
                    </p>
                  </li>
                ))}
              </ol>
              <nav className="ds_pagination" aria-label="Search result pages">
                <ul className="ds_pagination__list">
                  <li className="ds_pagination__item">
                    <a aria-label="Page 1" aria-current="page" className="ds_pagination__link ds_current" href="#">
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

export default Themes;