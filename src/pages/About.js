import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { Link } from 'react-router-dom'; // Import Link for routing
import BackToTop from '../components/BackToTop';

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
                To support and enable Data Publishers in publishing and updating data and metadata easily.
              </p>
              <p className="ds_lead">
                To support and enable Users to easily discover, find, access, and use the data and metadata they need.
              </p>
              <p className="ds_lead">
                To provide a data service that is accessible, usable, well-maintained, and trusted.
              </p>
              <p>
                We believe everyone has the right to share, access, and use data. We aim to bring you a wide and comprehensive range of open government data and statistics in one place to support openness, transparency and empowerment.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">History</h2>
              <p>
                In 2015, the Scottish Government published an Open Data Strategy to help achieve its data vision – a Scotland which recognises the value of data and responsibly make use of data to improve public services and deliver wider societal and economic benefits for all. A key National Action to emerge from the strategy was the scoping and establishment of a Scottish Data Discovery Site to be in place for early 2016. In February 2016, the Scottish Government launched Statistics.gov.scot, a new site for publishing the Official Statistics of Scotland and the data behind them.
              </p>
              <p>
                The site is actively managed by the Scottish Government’s Open Data Team that sits within the Digital Directorate’s Data Division.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Next Steps</h2>
              <p>
                The Scottish Government made a commitment to review the site as part of Scotland’s Open Government Action Plan 2021-25 to ensure the site is meeting user needs. In 2025, we published a blog updating you on our progress.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Partners and Stakeholders</h2>
              <p>
                The team works closely with many areas of the Scottish Government including the Office of the Chief Statistician, as well as organisations such as National Records of Scotland, Transport Scotland, and Public Health Scotland. Explore Data Producers here.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Open Government and Societal Impact</h2>
              <p>
                When we talk about opening up government, we mean making governments and decision makers more accessible, more transparent, and more able to involve the people they serve.
              </p>
              <p>
                An Open Government:
              </p>
              <ul>
                <li>gives the public information about the decisions it makes;</li>
                <li>supports people to understand and influence those decisions; and</li>
                <li>values and encourages accountability (responsibility for those decisions).</li>
              </ul>
              <p>
                Open governments also explore how they can use technology to support how they work and how they serve people. An Open Government is one which values openness, accountability, transparency and involving people.
              </p>
              <p>
                Statistics.gov.scot is critical for open government, transparency and empowerment as it provides a platform for publishing and making use of open data.
              </p>
            </div>
          </section>

          <section className="ds_layout ds_layout--article">
            <div className="ds_layout__content">
              <h2 className="ds_h2">Contact Us</h2>
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
