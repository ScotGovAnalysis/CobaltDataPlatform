import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navigation from './Navigation';
import '../App.css';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const menuCheckboxRef = useRef(null);
  const menuButtonRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setShowHeader(false);
      } else if (currentScrollY < lastScrollY.current) {
        setShowHeader(true);
      }

      lastScrollY.current = currentScrollY;
    };

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
      navigate(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (menuCheckboxRef.current) {
      menuCheckboxRef.current.checked = !isMenuOpen;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleMenu();
    }
  };

  // Update checkbox when isMenuOpen changes
  useEffect(() => {
    if (menuCheckboxRef.current) {
      menuCheckboxRef.current.checked = isMenuOpen;
    }
  }, [isMenuOpen]);

  // Handle outside clicks to close menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && menuButtonRef.current && !menuButtonRef.current.contains(event.target)) {
        const mobileNav = document.getElementById('mobile-navigation');
        if (mobileNav && !mobileNav.contains(event.target)) {
          setIsMenuOpen(false);
          if (menuCheckboxRef.current) {
            menuCheckboxRef.current.checked = false;
          }
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <header className={`ds_site-header ds_site-header--gradient ${!showHeader ? 'header-hidden' : ''}`} role="banner">
      <div className="ds_skip-links">
        <ul className="ds_skip-links__list">
          <li className="ds_skip-links__item">
            <a className="ds_skip-links__link" href="#main-content">Skip to main content</a>
          </li>
        </ul>
      </div>
      <div className="ds_wrapper">
        <div className="ds_site-header__content">
          <div className="ds_site-branding">
            <a className="ds_site-branding__logo ds_site-branding__link" href="/">
              <img
                className="ds_site-branding__logo-image"
                src="/assets/images/logos/scottish-government.svg"
                alt="Scottish Government"
              />
            </a>
            <div className="ds_site-branding__title">Cobalt Open Data Portal</div>
          </div>

          <div className="ds_site-header__controls">
            <button
              aria-controls="mobile-navigation"
              className="ds_site-header__control js-toggle-menu"
              aria-expanded={isMenuOpen}
              ref={menuButtonRef}
              onClick={toggleMenu}
              onKeyDown={handleKeyDown}
            >
              <span className="ds_site-header__control-text">Menu</span>
              <svg className="ds_icon ds_site-header__control-icon" aria-hidden="true" role="img">
                <use href="/assets/images/icons/icons.stack.svg#menu"></use>
              </svg>
              <svg
                className="ds_icon ds_site-header__control-icon ds_site-header__control-icon--active-icon"
                aria-hidden="true"
                role="img"
              >
                <use href="/assets/images/icons/icons.stack.svg#close"></use>
              </svg>
            </button>
          </div>

          <input
            className="ds_site-navigation__toggle"
            id="menu"
            type="checkbox"
            ref={menuCheckboxRef}
            onChange={(e) => setIsMenuOpen(e.target.checked)}
            aria-hidden="true"
          />

          <nav
            id="mobile-navigation"
            className={`ds_site-navigation ds_site-navigation--mobile ${isMenuOpen ? 'ds_site-navigation--open' : ''}`}
            data-module="ds-mobile-navigation-menu"
            aria-hidden={!isMenuOpen}
          >
            <Navigation currentPath={location.pathname} />
          </nav>

          <div className="ds_site-search ds_site-header__search" data-module="ds-site-search">
            <form onSubmit={handleSubmit} role="search" className="ds_site-search__form">
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
                <button type="submit" className="ds_button js-site-search-button">
                  <span className="visually-hidden">Search</span>
                  <svg className="ds_icon" aria-hidden="true" role="img">
                    <use href="/assets/images/icons/icons.stack.svg#search"></use>
                  </svg>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="ds_site-header__navigation">
        <div className="ds_wrapper">
          <nav className="ds_site-navigation">
            <Navigation currentPath={location.pathname} />
          </nav>
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