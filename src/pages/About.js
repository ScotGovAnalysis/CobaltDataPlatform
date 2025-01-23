import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css'; // Ensure Design System is properly imported

const About = () => {
  return (
    <div>
      <div className="ds_page__middle">
        <main id="main-content" style={{ marginTop: '10vh' }}>
          <div className="ds_wrapper">
            <div className="ds_cb__inner ds_cb__inner--spacious">
              <div className="ds_cb__text ds_cb__content ds_cb__text--center">
                <h1 className="ds_page-header__title">Search Results</h1>
                <p className="ds_lead ds_lead--spacious">
                  Explore the datasets matching your search criteria.
                </p>
                <div className="ds_site-search ds_site-search--large ds_site-search--spacious ds_site-search--with-border">
                  <form action="/search" role="search" className="ds_site-search__form" method="GET">
                    <label className="ds_label visually-hidden" htmlFor="site-search">Search</label>
                    <div className="ds_input__wrapper ds_input__wrapper--has-icon ds_input__wrapper--bordered">
                      <input
                        className="ds_input ds_site-search__input"
                        id="site-search"
                        name="q"
                        placeholder="Search here"
                        type="search"
                      />
                      <button type="submit" className="ds_button ds_button--icon-only ds_button--search ds_button--square">
                        <span className="visually-hidden">Search</span>
                        <svg className="ds_icon ds_icon--magnifying-glass" aria-hidden="true" role="img">
                          <use href="/webfiles/1737461086955/assets/images/icons/icons.stack.svg#magnifying-glass"></use>
                        </svg>
                      </button>
                    </div>
                  </form>
                </div>
                <p className="ds_hint-text ds_hint-text--spacious">For example, "population estimates" or "economy".</p>
              </div>
              <div className="ds_results">
                <h2>Results</h2>
                <ul className="ds_results__list">
                  <li className="ds_results__item">
                    <h3 className="ds_results__item-title">Dataset 1</h3>
                    <p className="ds_results__item-description">Description of dataset 1.</p>
                    <a href="#" className="ds_results__item-link">View Dataset</a>
                  </li>
                  <li className="ds_results__item">
                    <h3 className="ds_results__item-title">Dataset 2</h3>
                    <p className="ds_results__item-description">Description of dataset 2.</p>
                    <a href="#" className="ds_results__item-link">View Dataset</a>
                  </li>
                  {/* Add more dataset items as needed */}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;
