import React, { useEffect } from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { Link } from 'react-router-dom';
import BackToTop from '../components/BackToTop';

const About = () => {
  useEffect(() => {
    document.title = "Cobalt | About";
  }, []);

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">About</h1>
          </header>
          <section className="ds_layout ds_layout--article">
          <div className="ds_layout__content">
          <p className="ds_h3">Cobalt Open Data Portal</p>
          <p>
            The Scottish Government’s Open Data team is running an{' '}
            <a href="https://servicemanual.gov.scot/alpha" className="ds_link">
              Agile alpha
            </a>{' '}
            to build prototypes to test different ideas and explore new approaches for{' '}
            <a href="https://statistics.gov.scot" className="ds_link">
              statistics.gov.scot
            </a>. Prototypes will be focused on addressing the high priority user needs identified during discovery, as well as addressing the key problems and challenges our users face. This Cobalt Open Data Portal is one of those prototypes.
          </p>
          </div>

          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">Our Mission</h2>
              <ul>
                <li>To support and enable Data Publishers in publishing and updating data and metadata easily.</li>
                <li>To support and enable Users to easily discover, find, access, and use the data and metadata they need.</li>
                <li>To provide a data service that is accessible, usable, well-maintained, and trusted.</li>
              </ul>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">Vision</h2>
              <p>
                We believe everyone has the right to share, access, and use data. We aim to bring you a wide and comprehensive range of open government data and statistics in one place to support openness, transparency, and empowerment.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">History</h2>
              <p>
                In 2015, the Scottish Government published an{' '}
                <a href="https://www.gov.scot/publications/open-data-strategy/" className="ds_link">
                  Open Data Strategy
                </a>{' '}
                to help achieve its data vision – a Scotland which recognizes the value of data and responsibly makes use of data to improve public services and deliver wider societal and economic benefits for all. A key National Action to emerge from the strategy was the scoping and establishment of a{' '}
                <a href="https://www.gov.scot/publications/open-data-strategy/pages/5" className="ds_link">
                  Scottish Data Discovery Site
                </a>{' '}
                to be in place for early 2016. In February 2016, the Scottish Government launched{' '}
                <a href="https://statistics.gov.scot" className="ds_link">
                  Statistics.gov.scot
                </a>, a new site for publishing the Official Statistics of Scotland and the data behind them. The site is actively managed by the Scottish Government’s Open Data Team that sits within the Digital Directorate’s Data Division.
              </p>
              <p>
                The Scottish Government made a{' '}
                <a href="https://www.gov.scot/publications/open-government-action-plan-2021-to-2025-commitment-3-data-and-digital-commitment/" className="ds_link">
                  commitment
                </a>{' '}
                to review the site as part of Scotland’s Open Government Action Plan 2021-25 to ensure the site is meeting user needs. In 2024, the Open Data team completed a discovery aimed at better understanding statistics.gov.scot. In 2025, we published a{' '}
                <a href="https://blogs.gov.scot/digital/2025/01/23/statistics-gov-scot-improvement-project-discovery/" className="ds_link">
                  blog
                </a>{' '}
                updating you on our progress as well as the{' '}
                <a href="https://www.gov.scot/publications/statistics-gov-scot-improvement-project-report-discovery-user-research/" className="ds_link">
                  full report
                </a>{' '}
                on the program of user research completed as part of the 2024 discovery.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">Contact Us</h2>
              <p>If you'd like to get in contact, please reach out through the contact form below.</p>
              <Link to="/contact" className="ds_button ds_button--primary">
                Contact us
              </Link>
            </div>
          </section>
        </main>
      </div>
      <BackToTop />
    </div>
  );
};

export default About;
