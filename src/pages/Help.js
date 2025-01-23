import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Help = () => {
  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
          {/* Page Header */}
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">Help & Support</h1>
            <p className="ds_page-header__subtitle">
              Find answers to common questions and get support for the Cobalt Open Data Portal.
            </p>
          </header>

          {/* FAQ Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Frequently Asked Questions</h2>
              <div className="ds_accordion">
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className="visually-hidden ds_accordion-item__control"
                    id="faq-1"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">How do I search for datasets?</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-1">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt
                      aliquet, nunc nisi aliquet nunc, nec aliquet nunc nisi nec nunc.
                    </p>
                  </div>
                </div>
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className="visually-hidden ds_accordion-item__control"
                    id="faq-2"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">How do I download a dataset?</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-2">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin euismod, nisl nec tincidunt
                      aliquet, nunc nisi aliquet nunc, nec aliquet nunc nisi nec nunc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Support Section */}
          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Contact Support</h2>
              <p>
                If you can't find the answer to your question, please contact our support team. We're here to help!
              </p>
              <a href="mailto:auren.clark@gov.scot" className="ds_button ds_button--primary">
                Contact Support
              </a>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Help;