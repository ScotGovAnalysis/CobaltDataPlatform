import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import '../App.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scroll down past 100px threshold
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY.current) {
        // Scroll up
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

    // Throttle scroll handler
    let throttleTimeout;
    const throttledHandleScroll = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          handleScroll();
          throttleTimeout = null;
        }, 100);
      }
    };

    window.addEventListener('scroll', throttledHandleScroll);
    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, []);

  useEffect(() => {
    const header = document.querySelector('.ds_site-header');
    if (header) {
      const height = header.offsetHeight;
      document.documentElement.style.setProperty('--header-height', `${height}px`);
    }
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to results page with search query
      navigate(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
      // Optional: Clear the search input after submission
      setSearchQuery('');
    }
  };

  return (
    <header 
      className={`ds_site-header ${!showHeader ? 'header-hidden' : ''}`} 
      role="banner"
    >      <div className="ds_wrapper">
        <div className="ds_site-header__content">
          <div className="ds_site-branding">
            <a className="ds_site-branding__logo ds_site-branding__link" href="/">
<img
  width="300"
  height="58"
  className="ds_site-branding__logo-image"
  src="/assets/images/logos/scottish-government.svg"
  alt="The Scottish Government"
/>
            </a>
            <div className="ds_site-branding__title">Cobalt Open Data Portal</div>
          </div>
          <div className="ds_site-header__controls">
  <label aria-controls="mobile-navigation" className="ds_site-header__control js-toggle-menu" htmlFor="menu">
    <span className="ds_site-header__control-text">Menu</span>
    <svg className="ds_icon ds_site-header__control-icon" aria-hidden="true" role="img">
      <use href="/assets/images/icons/icons.stack.svg#menu"></use>
    </svg>
    <svg className="ds_icon ds_site-header__control-icon ds_site-header__control-icon--active-icon" aria-hidden="true" role="img">
      <use href="/assets/images/icons/icons.stack.svg#close"></use>
    </svg>
  </label>
</div>
          <input className="ds_site-navigation__toggle" id="menu" type="checkbox" />
          <Navigation />
          <div className="ds_site-header__search">
            <div className="ds_site-search">
              <form onSubmit={handleSubmit} role="search" className="ds_site-search__form" method="GET">
                <label className="ds_label visually-hidden" htmlFor="site-search">Search</label>
                <div className="ds_input__wrapper ds_input__wrapper--has-icon">
                  <input
                    className="ds_input ds_site-search__input"
                    id="site-search"
                    name="q"
                    placeholder="Search"
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button 
                    type="submit" 
                    className="ds_button ds_button--icon-only js-site-search-button"
                    onClick={handleSubmit}
                  >
                    <span className="visually-hidden">Search</span>
                    <svg className="ds_icon ds_icon--24" aria-hidden="true" role="img" viewBox="0 0 24 24">
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                    </svg>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className="ds_phase-banner">
        <div className="ds_wrapper">
          <p className="ds_phase-banner__content">
            <strong className="ds_tag ds_phase-banner__tag">Alpha</strong>
            <span className="ds_phase-banner__text">
              This is a new service. Your <a href="mailto:statistics.opendata@gov.scot">feedback</a> will help us to improve it.
            </span>
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;