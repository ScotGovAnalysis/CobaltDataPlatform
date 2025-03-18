import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config';
import BackToTop from '../components/BackToTop';
import styles from '../styles/Design_Style.module.css';
import { PropagateLoader } from 'react-spinners';

const Organisation = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Organisation";
  }, []);

  const { organisationName } = useParams();
  const [organisation, setOrganisation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('relevance');
  const [filteredResults, setFilteredResults] = useState([]);

  useEffect(() => {
    const fetchOrganisationDetails = async () => {
      try {
        const response = await fetch(
          `${config.apiBaseUrl}/api/3/action/organization_show?id=${organisationName}&include_datasets=true&include_users=true`
        );
        if (!response.ok) throw new Error('Failed to fetch organisation details');
        const data = await response.json();
        setOrganisation(data.result);
        setFilteredResults(data.result.packages || []);
        setLoading(false);
      } catch (error) {
        setError(error.message);
        setLoading(false);
      }
    };
    fetchOrganisationDetails();
  }, [organisationName]);

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
          // Keep original order for relevance
          break;
      }

      setFilteredResults(sorted);
    }
  }, [sortBy, organisation]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  const applySorting = (e) => {
    e.preventDefault();
    // The actual sorting is handled by the useEffect above
  };

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
          {/* Header Section */}
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

            <header className="ds_page-header ds_page-header--with-image">
              <div className="ds_organisation-header">
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
                  <h1 className="ds_page-header__title">{organisation.title}</h1>
                </div>
              </div>
            </header>
          </div>

          {/* Main Content */}
          <div className="ds_layout__list">
            {/* Organisation Description */}
            <section className="ds_organisation-description">
              <h2 className="visually-hidden">About {organisation.title}</h2>
              <div className="ds_lead ds_!_margin-bottom--6">
                <p>{organisation.description}</p>
              </div>
            </section>

            {/* Dataset List */}
            <div className="ds_dataset-list">
              <header className="ds_dataset-list-header">
                <h2 className="ds_h3">Datasets ({organisation.package_count})</h2>
                <div className="ds_sort-options">
                  <label className="ds_label" htmlFor="sort-by">Sort by</label>
                  <span className={`ds_select-wrapper ${styles.selectWrapper}`}>
                    <select className={`ds_select ${styles.select}`} id="sort-by" value={sortBy} onChange={handleSortChange}>
                      <option value="relevance">Most relevant</option>
                      <option value="date">Updated (newest)</option>
                      <option value="adate">Updated (oldest)</option>
                    </select>
                    <span className={`ds_select-arrow ${styles.selectArrow}`} aria-hidden="true"></span>
                  </span>
                  <button className="ds_button ds_button--secondary ds_button--small" type="submit" onClick={applySorting}>Apply sort</button>
                </div>
              </header>

              <ol className="ds_search-results__list" data-total={filteredResults.length} start="1">
                {filteredResults.map((result) => (
                  <li key={result.id} className="ds_search-result">
                    <h3 className="ds_search-result__title">
                      <Link
                        to={{
                          pathname: `/dataset/${result.name}`,
                          state: { fromResults: true }
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
                        return words.length > 65 ? words.slice(0, 65).join(' ') + '...' : text;
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
                            {
                              [...new Set(result.resources.map(resource => resource.format))]
                              .join(', ')
                            }
                          </dd>
                        </div>
                      )}
                    </dl>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Last Updated</dt>
                        <dd className="ds_metadata__value">
                          Last updated: {new Date(result.metadata_modified).toLocaleDateString()}
                        </dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Metadata Sidebar */}
          <div className="ds_layout__sidebar">
            <div className="ds_metadata__panel">
              <h3 className="ds_metadata__panel-title">Organisation Details</h3>
              <dl className="ds_metadata ds_metadata--stacked">
                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Established</dt>
                  <dd className="ds_metadata__value">{' '}
                    {new Date(organisation.created).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Status</dt>
                  <dd className="ds_metadata__value">{' '}
                    <span className={`ds_badge ${organisation.state === 'active' ? 'ds_badge--success' : ''}`}>
                      {organisation.state === 'active' ? 'Active' : organisation.state.charAt(0).toUpperCase() + organisation.state.slice(1).toLowerCase()}
                    </span>
                  </dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Administrators</dt>
                  <dd className="ds_metadata__value">{' '}
                    {organisation.users?.map(user => (
                      <div key={user.id} className="ds_user-badge">
                        <span className="ds_user-badge__name">{user.display_name}</span>
                        <span className="ds_user-badge__role">{user.capacity}</span>
                      </div>
                    ))}
                  </dd>
                </div>

                <div className="ds_metadata__item">
                  <dt className="ds_metadata__key">Contact</dt>
                  <dd className="ds_metadata__value">{' '}
                    <a
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
        </main>
      </div>
      <BackToTop />
    </div>
  );
};

export default Organisation;
