import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // Import Link for routing
import '@scottish-government/design-system/dist/css/design-system.min.css'; // Ensure Design System is properly imported

const Home = () => {
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch popular tags from the CKAN API
    const fetchPopularTags = async () => {
      try {
        const response = await fetch('/api/action/tag_list'); // Replace with your CKAN API URL
        if (!response.ok) {
          throw new Error('Failed to fetch popular tags');
        }
        const data = await response.json();
        setPopularTags(data.result);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularTags();
  }, []);

  return (
    <div className="ds_page__middle">
      <main id="main-content">
        {/* Blue Background Block */}
        <div className="ds_cb ds_cb--blue" style={{ backgroundColor: '#005EB8', padding: '2rem 0' }}>
          <div className="ds_wrapper">
            <div className="ds_cb__inner ds_cb__inner--spacious">
              <div className="ds_layout">
                {/* Left Column: Text */}
                <div className="ds_layout__content">
                  <h1 className="ds_page-header__title" style={{ color: '#FFFFFF' }}>
                    Open access to Scotland's official statistics
                  </h1>
                  <p className="ds_lead" style={{ color: '#FFFFFF' }}>
                    Explore, visualise and download over 250 datasets from a range of producers. Start browsing by theme, organisation, or geography.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        <div className="ds_wrapper" style={{ marginTop: '-1.5rem' }}>
          <div className="ds_cb__inner">
            <div className="ds_site-search ds_site-search--large" style={{ width: '100%' }}>
              <form action="/results" role="search" className="ds_site-search__form" method="GET">
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
                    style={{ width: '60%' }} // Make the search bar wider
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
            {loading ? (
              <p className="ds_hint-text" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                Loading popular tags...
              </p>
            ) : error ? (
              <p className="ds_hint-text" style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'red' }}>
                Error: {error}
              </p>
            ) : (
            <div style={{ marginTop: '1rem' }}>
              <h3 className="ds_h3">Popular Tags</h3>
              <div className="ds_tag-list" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {popularTags.slice(0, 6).map((tag, index) => ( // Limit to 5 tags
                  <Link
                    key={index}
                    to={`/results?q=${encodeURIComponent(tag)}`} // Navigate to Results page with the tag as a query parameter
                    className="ds_button ds_button--secondary" // Use the secondary button style
                    style={{ marginBottom: '0.5rem' }} // Add some spacing between buttons
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>
            )}
          </div>
        </div>

        {/* Browse by Category Section */}
        <div className="ds_wrapper" style={{ marginTop: '2.5rem' }}> {/* Added more space below the search bar */}
          <div className="ds_cb__inner">
            <h2 className="ds_h3">Browse by Category</h2>
            <p className="ds_lead">
              Explore datasets by themes such as health, education, and economy.
            </p>
            <Link to="/categories" className="ds_button ds_button--primary">
              Browse Categories
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;