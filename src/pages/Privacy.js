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
              <div className="ds_page-header__subtitle">
                How we handle your information on statistics.gov.scot
              </div>
            </header>

            <div className="ds_layout ds_layout--article">
              <div className="ds_layout__content">
                <section aria-labelledby="collection-heading">
                  <h2 id="collection-heading" className="ds_h2">Information We Collect</h2>
                  <p>We collect and process the following information when you visit statistics.gov.scot:</p>
                  <ul className="ds_list">
                    <li>any feedback you share with us</li>
                    <li>your cookies using Google Analytics</li>
                    <li>your IP address</li>
                  </ul>
                </section>

                <section aria-labelledby="analytics-heading">
                  <h2 id="analytics-heading" className="ds_h2">Google Analytics Information</h2>
                  <p>We use Google Analytics to collect information about:</p>
                  <ul className="ds_list">
                    <li>which type of browser and device you used</li>
                    <li>the pages you visit on statistics.gov.scot</li>
                    <li>how long you spend on each statistics.gov.scot page</li>
                    <li>how you got to the site</li>
                    <li>what you click on while you're visiting the site</li>
                  </ul>
                </section>

                <section aria-labelledby="usage-heading">
                  <h2 id="usage-heading" className="ds_h2">How We Use Your Information</h2>
                  <p>We use the information to improve our service. Google Analytics data is only collected from users who have consented to share this data.</p>
                  <p>Any information we get about you from Google Analytics will be anonymised before we see it. This means we will not hold any personally identifiable information about you, such as your name or address.</p>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default Privacy;