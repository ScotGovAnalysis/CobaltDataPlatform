import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const About = () => {
  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
          {/* Page Header */}
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">About Cobalt Open Data Portal</h1>
            <p className="ds_page-header__subtitle">
              Learn more about this Alpha.
            </p>
          </header>

          {/* Introduction Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Our Mission</h2>
              <p className="ds_lead">
               Accessibility statement

This accessibility statement applies to statistics.gov.scot.

This website is run by the Scottish Government. It is designed to be used by as many people as possible. You should be able to:

use your web browser to change colours, contrast levels and fonts

zoom in up to 300% without loss of information

navigate the website using just a keyboard

navigate the website using speech recognition software

listen to the website using a screen reader (including the most recent versions of JAWS, NVDA and VoiceOver)

access the website using a mobile or tablet

Feedback and contact information

We want to find ways to improve the accessibility of this website.

If you find any problems or think we’re not meeting accessibility requirements, email statistics.opendata@gov.scot with details.

Compliance status

This website is partially compliant with the Web Content Accessibility Guidelines (WCAG) version 2.2 A and AA success criteria. 
              </p>
            
        </main>
      </div>
    </div>
  );
};

export default Accessibility;
