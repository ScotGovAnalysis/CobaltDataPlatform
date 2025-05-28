import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { useEffect } from 'react';

const Accessibility = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Accessibility";
  }, []);   
  
  return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <main id="main-content">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">Accessibility Statement</h1>
            </header>

            <div className="ds_layout ds_layout--article">
              <div className="ds_layout__content">
                <section>
                  <p>We do not have an accessibility statement for this prototype website. As part of the current Alpha phase, we have completed an initial accessibility review and will be undertaking specific accessibility testing.</p>
                      <p>If you would like to help test the site then <a href="https://forms.cloud.microsoft/e/PgLvWLxvuB">please register your interest</a> in our user testing sessions.</p>

                </section>

              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default Accessibility;
