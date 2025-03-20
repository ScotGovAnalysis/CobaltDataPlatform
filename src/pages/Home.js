import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config.js'
import styles from '../styles/Design_Style.module.css'

const Home = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Home";
  }, []);

  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [introText, setIntroText] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Fetch popular tags from the CKAN API
    const fetchPopularTags = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/action/tag_list`);
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

    // Fetch intro text from CKAN API
    const fetchIntroText = async () => {
      try {
        const response = await fetch(`${config.apiBaseUrl}/api/3/action/config_option_show`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': config.apiToken
          },
          body: JSON.stringify({
            key: 'ckan.site_intro_text'
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch intro text');
        }

        const data = await response.json();
        if (data.success) {
          // Update the intro text with HTML formatting
          const formattedText = data.result
            .replace('datasets', '<strong><u><a href="/datasets" style="color: #FFFFFF;">datasets</a></u></strong>')
            .replace('contact us', '<strong><u><a href="/contact" style="color: #FFFFFF;">contact us</a></u></strong>')
            .replace('help', '<strong><u><a href="/help" style="color: #FFFFFF;">help</a></u></strong>')
            .replace('theme', '<strong><u><a href="/themes" style="color: #FFFFFF;">theme</a></u></strong>')
            .replace('organisations', '<strong><u><a href="/organisations" style="color: #FFFFFF;">organisations</a></u></strong>')
            .replace(/\r\n\r\n/g, '</p><p>'); // Replace double newlines with paragraph tags
          setIntroText(formattedText || 'Find and access data from the Scottish Government and its agencies');
        } else {
          throw new Error(data.error?.message || 'Failed to fetch intro text');
        }
      } catch (error) {
        console.error('Error fetching intro text:', error);
        setIntroText('Find and access data from the Scottish Government and its agencies');
      }
    };

    fetchPopularTags();
    fetchIntroText();
  }, []);

  return (
    <div className="ds_page__middle">
      <main id="main-content">
        {/* Blue Background Block */}
        <div className="ds_cb ds_cb--blue" style={{ backgroundColor: '#005EB8', padding: '2rem' }}>
          <div className="ds_wrapper">
            <div className="ds_cb__inner ds_cb__inner--spacious">
              <div className="ds_layout">
                {/* Left Column: Text */}
                <div className="ds_layout__content">
                  <h1 className="ds_page-header__title" style={{ color: '#FFFFFF', marginBottom: '12.5px' }}>
                    Open access to Scotland's data
                  </h1>
                  <p className="ds_lead" style={{ color: '#FFFFFF' }}
                     dangerouslySetInnerHTML={{ __html: introText }} />
                  <div className="ds_cb__inner">
                  <div className="ds_site-search ds_site-search--large" style={{ marginBottom: '-5px' }}>
      <form action="/results" role="search" className="ds_site-search__form" method="GET">
        <label className="ds_label visually-hidden" htmlFor="site-search">Search</label>
        <div
          className="ds_input__wrapper ds_input__wrapper--has-icon"
          style={{
            border: '2px solid white',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            background: isHovered ? '#e0e0e0' : '#f5f5f5',
            overflow: 'hidden',
            width: '75%'
          }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <input
            name="q"
            required
            id="site-search"
            className="ds_input ds_site-search__input"
            type="search"
            placeholder="Search our data"
            autoComplete="off"
            style={{
              width: '100%',
              border: 'none',
              outline: 'none',
              background: 'inherit',
              padding: '8px'
            }}
          />
          <button
            type="submit"
            className="ds_button js-site-search-button"
            style={{
              border: 'none',
              background: isHovered ? '#00437d' : '#0065bd',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              cursor: 'pointer'
            }}
          >
            <span className="visually-hidden">Search</span>
            <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24" style={{ fill: 'white' }}>
              <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
            </svg>
          </button>
        </div>
      </form>
    </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar Section */}
        </div>
        <div className="ds_wrapper" style={{ marginTop: '1.5rem' }}>
          <div className="ds_cb__inner">
          <h3 className="ds_h3">Browse By</h3>
            <nav aria-label="Category navigation">
              <ul className="ds_category-list ds_category-list--grid ds_category-list--narrow" style={{ marginTop: '-0.5rem' }}>
                <li className="ds_card ds_card--has-hover">
                  <article className="ds_category-item ds_category-item--card">
                    <h2 className="ds_category-item__title">
                      <Link to="/datasets" className="ds_category-item__link">
                        Datasets
                      </Link>
                    </h2>
                    <p className="ds_category-item__summary">
                      A wide range of datasets available for public use.
                    </p>
                  </article>
                </li>
                <li className="ds_card ds_card--has-hover">
                  <article className="ds_category-item ds_category-item--card">
                    <h2 className="ds_category-item__title">
                      <Link to="/organisations" className="ds_category-item__link">
                        Organisations
                      </Link>
                    </h2>
                    <p className="ds_category-item__summary">
                      Organisations publishing Scotland's official statistics.
                    </p>
                  </article>
                </li>
                <li className="ds_card ds_card--has-hover">
                  <article className="ds_category-item ds_category-item--card">
                    <h2 className="ds_category-item__title">
                      <Link to="/themes" className="ds_category-item__link">
                        Themes
                      </Link>
                    </h2>
                    <p className="ds_category-item__summary">
                      Datasets by themes such as health, education and economy.
                    </p>
                  </article>
                </li>
              </ul>
            </nav>
          </div>
        </div>
        {/* Navigation Buttons Section */}
        <div className="ds_wrapper" style={{ marginTop: '1.5rem' }}>

     {loading ? (
       <p className="ds_hint-text" style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
         Loading popular tags...
       </p>
     ) : error ? (
       <p className="ds_hint-text" style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'red' }}>
         Error: {error}
       </p>
     ) : (
     <div style={{ marginTop: '0.5rem' }}>
       <h3 className="ds_h3">Popular Tags</h3>
       <div className={styles.sgTagList} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '-0.5rem' }}>
         {popularTags.slice(0, 6).map((tag, index) => (
           <Link
             key={index}
             to={`/results?q=${encodeURIComponent(tag)}`}
             className={styles.sgTag}
           >
             {tag}
           </Link>
         ))}
       </div>
     </div>
     )}
   </div>

      </main>
    </div>
  );
};

export default Home;
