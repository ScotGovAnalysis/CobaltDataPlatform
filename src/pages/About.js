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
            <p>
 ABNOUT TEXT
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
sdgfd
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
