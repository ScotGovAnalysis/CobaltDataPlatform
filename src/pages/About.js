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
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt aliquet, nunc
                nisi aliquet nunc, nec aliquet nunc nisi nec nunc.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt aliquet, nunc
                nisi aliquet nunc, nec aliquet nunc nisi nec nunc. Sed euismod, nisl nec tincidunt aliquet, nunc nisi
                aliquet nunc, nec aliquet nunc nisi nec nunc.
              </p>
            </div>
          </section>

          {/* Team Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Our Team</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt aliquet, nunc
                nisi aliquet nunc, nec aliquet nunc nisi nec nunc.
              </p>
              <div className="ds_card-grid">
                <div className="ds_card">
                  <div className="ds_card__media">
                    <img
                      src="https://via.placeholder.com/400x300"
                      alt="Team Member 1"
                      className="ds_card__image"
                    />
                  </div>
                  <div className="ds_card__content">
                    <h3 className="ds_card__title">John Doe</h3>
                    <p className="ds_card__description">Data Scientist</p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt
                      aliquet, nunc nisi aliquet nunc.
                    </p>
                  </div>
                </div>
                <div className="ds_card">
                  <div className="ds_card__media">
                    <img
                      src="https://via.placeholder.com/400x300"
                      alt="Team Member 2"
                      className="ds_card__image"
                    />
                  </div>
                  <div className="ds_card__content">
                    <h3 className="ds_card__title">Jane Smith</h3>
                    <p className="ds_card__description">Data Analyst</p>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt
                      aliquet, nunc nisi aliquet nunc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Contact Us</h2>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt aliquet, nunc
                nisi aliquet nunc, nec aliquet nunc nisi nec nunc.
              </p>
              <a href="mailto:TBC" className="ds_button ds_button--primary">
                Email Us
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default About;