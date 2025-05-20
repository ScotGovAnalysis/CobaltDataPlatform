import '@scottish-government/design-system/dist/css/design-system.min.css';
import { useEffect, React } from 'react';

const Privacy = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Privacy";
  }, []); 
  
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <main id="main-content">
            <header className="ds_page-header">
              <h1 className="ds_page-header__title">Privacy Notice</h1>
            </header>

            <div className="ds_layout ds_layout--article">
              <div className="ds_layout__content">
                <section aria-labelledby="collection-heading">
                  <p>We are not collecting information about you through this prototype website.</p>
                  <p>If you would like to help test the website then <a href="https://forms.cloud.microsoft/e/PgLvWLxvuB">please register your interest</a> in our user testing sessions.</p>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default Privacy;
