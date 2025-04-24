// Updated Help.jsx component
import { useEffect, React } from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import styles from '../styles/Design_Style.module.css';
import { Link } from 'react-router-dom'; // Import Link for routing
import BackToTop from '../components/BackToTop';

const Help = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Help";
  }, []);   
  
  
  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">Help & Support</h1>
            </header>

            <p className="ds_page-header__subtitle">
              Find answers to common questions and get support for the Cobalt Open Data Portal.
            </p>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Frequently Asked Questions</h2>
              <div className="ds_accordion">
                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-1"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">How do I find data?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-1">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      There are many ways to find and discover data. You can search for data in the search boxes on the home page or in the page header by using relevant key words, such as ‘population’ or ‘National Records’. You can go to the Datasets page to browse, filter and sort all datasets. You can also go to the Organisations page to browse all organisations who provide data to the site.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-2"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">How do I download the data I’m interested in?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-2">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      Once you have located your dataset, e.g., Police Officer Quarterly Strength, you can download the data in CSV format by clicking on the download button beneath the Resources header.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-3"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">How do I know if the data is reliable and of good quality?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-3">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      We work with Data Producers to provide high quality metadata to describe the data. This information is available on the data’s dataset page. A data dictionary accompanies each resource. If you need more information, you can contact the data producer directly from their contact details on the respective dataset page.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-4"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">How do I use the API to access data?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-4">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      Each resource which has an API end-point shows an API button.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-5"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">How up to date is the data on this site?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-5">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      We work with Data Producers to keep the data and metadata on this site up to date. On each dataset’s page you can find when the dataset was last modified and the frequency the data is updated. Unless specified otherwise, we aim to update each dataset regularly and the data should be considered the latest version.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-6"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">If I can’t find data on your site, where else might it be?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-6">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      Statistics.gov.scot is just one data publishing platform and there are many others, e.g., Public Health Scotland’s Scottish Health and Social Care Open Data platform, and the Scottish Government’s Spatial Data platform. Depending on your search, you might want to consider other platforms. Searching directly into your favourite search engine with relevant keywords may yield results as many platforms have their data well tagged and marked-up to support search.
                    </p>
                  </div>
                </div>

                <div className="ds_accordion-item">
                  <input
                    type="checkbox"
                    className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
                    id="faq-7"
                  />
                  <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
                    <h3 className="ds_accordion-item__title">I have feedback on the site, how do I share this?</h3>
                    <span className={styles.accordionIndicator}></span>
                    <label className="ds_accordion-item__label" htmlFor="faq-7">
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <p>
                      We’re always keen to hear from you. Please get in touch with any feedback or let us know how we can help you.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
          <div className="ds_layout__content">
            <h2 className="ds_h2">Contact Support</h2>
            <p>
              If you can't find the answer to your question, please contact our support team. We're here to help!
            </p>
            <Link to="/contact" className="ds_button ds_button--primary">
              Contact us
            </Link>
          </div>
        </section>
        <BackToTop />

        </main>
        
      </div>

    </div>
  );
};

export default Help;
