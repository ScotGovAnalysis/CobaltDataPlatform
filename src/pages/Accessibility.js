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
              <div className="ds_page-header__subtitle">
                For statistics.gov.scot
              </div>
            </header>

            <div className="ds_layout ds_layout--article">
              <div className="ds_layout__content">
                <section aria-labelledby="intro-heading">
                  <h2 id="intro-heading" className="ds_h2">Introduction</h2>
                  <p>This accessibility statement applies to statistics.gov.scot. This website is run by the Scottish Government. It is designed to be used by as many people as possible.</p>
                </section>

                <section aria-labelledby="features-heading">
                  <h2 id="features-heading" className="ds_h2">Accessibility Features</h2>
                  <p>You should be able to:</p>
                  <ul className="ds_list">
                    <li>use your web browser to change colours, contrast levels and fonts</li>
                    <li>zoom in up to 300% without loss of information</li>
                    <li>navigate the website using just a keyboard</li>
                    <li>navigate the website using speech recognition software</li>
                    <li>listen to the website using a screen reader (including the most recent versions of JAWS, NVDA and VoiceOver)</li>
                    <li>access the website using a mobile or tablet</li>
                  </ul>
                </section>

                <section aria-labelledby="feedback-heading">
                  <h2 id="feedback-heading" className="ds_h2">Feedback and Contact Information</h2>
                  <p>We want to find ways to improve the accessibility of this website.</p>
                  <p>If you find any problems or think we're not meeting accessibility requirements, please contact us:</p>
                  <ul className="ds_list">
                    <li>
                      Email: <a href="mailto:statistics.opendata@gov.scot" className="ds_link">statistics.opendata@gov.scot</a>
                    </li>
                  </ul>
                </section>

                <section aria-labelledby="compliance-heading">
                  <h2 id="compliance-heading" className="ds_h2">Compliance Status</h2>
                  <p>This website is partially compliant with the Web Content Accessibility Guidelines (WCAG) version 2.2 A and AA success criteria.</p>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
  );
};

export default Accessibility;