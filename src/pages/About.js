import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { Link } from 'react-router-dom'; // Import Link for routing
import BackToTop from '../components/BackToTop';
import { useEffect } from 'react';


const About = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | About";
  }, []); 

  
  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
          {/* Page Header */}
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">About</h1>
         
          </header>

          <p className="ds_h3">
              Cobalt Open Data Portal
            </p>
            <p>The Scottish Government’s Open Data team are running an Agile alpha to build prototypes to test different ideas and explore new approaches for statistics.gov.scot. Prototypes will be focused on addressing the high priority user needs that were identified during discovery, as well as addressing the key problems and challenges our users face. This Cobalt Open Data Portal is one of those prototypes. 
              </p>
          {/* Introduction Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">Our Mission</h2>
              <ul>
              <li>
                                To support and enable Data Publishers in publishing and updating data and metadata easily.
              </li>
              <li>
                To support and enable Users to easily discover, find, access, and use the data and metadata they need.
                </li>
                <li>
                To provide a data service that is accessible, usable, well-maintained, and trusted.
                </li>

                </ul>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">Vision</h2>
              <p>
              We believe everyone has the right to share, access, and use data. We aim to bring you a wide and comprehensive range of open government data and statistics in one place to support openness, transparency and empowerment.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3">History</h2>
              <p>
In 2015, the Scottish Government published an Open Data Strategy to help achieve its data vision – a Scotland which recognises the value of data and responsibly make use of data to improve public services and deliver wider societal and economic benefits for all. A key National Action to emerge from the strategy was the scoping and establishment of a Scottish Data Discovery Site to be in place for early 2016. 

In February 2016, the Scottish Government launched Statistics.gov.scot, a new site for publishing the Official Statistics of Scotland and the data behind them. The site is actively managed by the Scottish Government’s Open Data Team that sits within the Digital Directorate’s Data Division. 

The Scottish Government made a commitment to review the site as part of Scotland’s Open Government Action Plan 2021-25 to ensure the site is meeting user needs. In 2024, the Open Data team completed a discovery aimed better understanding statistics.gov.scot. In 2025, we published a blog updating you on our progress as well as the full report on the programme of user research completed as part of the 2024 discovery.
              </p>
            </div>
          </section>



          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h3  ">Contact Us</h2>
              <p>
                If you'd like to get in contact, please reach out through the contact form below.
              </p>
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
