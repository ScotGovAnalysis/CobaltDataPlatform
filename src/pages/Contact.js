import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { Phone, Mail, MapPin } from 'lucide-react';
import styles from '../styles/Design_Style.module.css';
import checkboxStyles from '../styles/Checkbox.module.css'; 

const Contact = () => {
  useEffect(() => {
    document.title = "Emerald | Contact Us";
  }, []);

  const navigate = useNavigate();
  const [alertShown, setAlertShown] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      navigate('/home');
    }, 1000);
  };

  const handleFormInteraction = () => {
    if (!alertShown) {
      window.alert(
        "This page is a dummy for alpha testing purposes. Please get in touch directly via email: statistics.opendata@gov.scot"
      );
      setAlertShown(true);
    }
  };

  return (
    <div>
      <div className="ds_page__top">
        <div className="ds_wrapper">
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">Contact us</h1>
          </header>
          <p className="ds_!text-white ds_!text-lg">
            The Open Data team values your feedback, questions or comments. We are always happy to hear from you.
          </p>
        </div>
      </div>

      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_layout ds_layout--sidebar-first">
            <div className="ds_layout__sidebar">
              <aside>
                <div className="ds_!bg-gray-50 ds_!p-6 ds_!rounded-lg ds_!mb-8">
                  <h2 className="ds_h3 ds_!text-sky-600 ds_!mb-4">Quick Help</h2>
                  <ul className="ds_list ds_!mb-0">
                    <li><a href="/help" className="ds_link">How to use this site</a></li>
                    <li><a href="/about" className="ds_link">About this site</a></li>
                  </ul>
                </div>

                <div className="ds_contact-info ds_!bg-white ds_!p-6 ds_!rounded-lg ds_!shadow-sm">
                  <h2 className="ds_h3 ds_!text-sky-600 ds_!mb-6">Ways to Reach Us</h2>
                  <div className="ds_!flex ds_!items-center ds_!mb-6">
                    <Mail className="ds_!text-sky-400 ds_!mr-3" size={24} />
                    <div>
                      <h3 className="ds_h4 ds_!mb-1">Email Us</h3>
                      <a href="mailto:statistics.opendata@gov.scot" className="ds_link">
                        statistics.opendata@gov.scot
                      </a>
                    </div>
                  </div>
                  <hr />
                  <div className="ds_!flex ds_!items-center ds_!mb-6">
                    <Phone className="ds_!text-sky-400 ds_!mr-3" size={24} />
                    <div>
                      <h3 className="ds_h4 ds_!mb-1">Call Us</h3>
                      <a href="tel:+441234567890" className="ds_link">+44 123 456 7890</a>
                      <p className="ds_!text-sm ds_!text-gray-600 ds_!mt-1">Mon-Fri, 9am-5pm</p>
                    </div>
                  </div>
                  <hr />
                  <div className="ds_!flex ds_!items-center ds_!mb-6">
                    <MapPin className="ds_!text-sky-400 ds_!mr-3" size={24} />
                    <div>
                      <h3 className="ds_h4 ds_!mb-1">Visit Us</h3>
                      <address className="ds_!not-italic ds_!text-sm">
                        Open Data Team<br />
                        Scottish Government<br />
                        Victoria Quay<br />
                        Edinburgh, EH6 6QQ
                      </address>
                    </div>
                  </div>
                </div>
              </aside>
            </div>

            <div className="ds_layout__content">
              <main id="main-content">
                <div className="ds_!bg-white ds_!p-8 ds_!rounded-lg ds_!shadow-sm">
                  <h2 className="ds_h2 ds_!text-sky-600 ds_!mb-4">Send Us a Message</h2>

                  <form onSubmit={handleSubmit} className="ds_form">
                    <div className="ds_!grid ds_!grid-cols-2 ds_!gap-4">
                      <div className="ds_form-group">
                        <label className="ds_label" htmlFor="name">Your Name</label>
                        <input
                          className="ds_input"
                          type="text"
                          id="name"
                          name="name"
                          placeholder="John Smith"
                          required
                          onFocus={handleFormInteraction}
                        />
                      </div>
                      <div className="ds_form-group">
                        <label className="ds_label" htmlFor="email">Your Email</label>
                        <input
                          className="ds_input"
                          type="email"
                          id="email"
                          name="email"
                          placeholder="john@example.com"
                          required
                          onFocus={handleFormInteraction}
                        />
                      </div>
                    </div>

                    <div className="ds_form-group">
                      <label className="ds_label" htmlFor="subject">Subject</label>
                      <input
                        className="ds_input"
                        type="text"
                        id="subject"
                        name="subject"
                        placeholder="How can we help?"
                        required
                        onFocus={handleFormInteraction}
                      />
                    </div>

                    <div className="ds_form-group">
                      <label className="ds_label" htmlFor="query-type">Type of Query</label>
                      <div className={`ds_select-wrapper ${styles.selectWrapper}`} style={{ width: '100%', maxWidth: '100%' }}>
                        <select
                          className={`ds_select ${styles.select}`}
                          id="query-type"
                          name="query-type"
                          required
                          onFocus={handleFormInteraction}
                          style={{ width: '100%' }}
                        >
                          <option value="">Please select...</option>
                          <option value="question">Open Data Question</option>
                          <option value="support">Technical Support</option>
                          <option value="feedback">Share Feedback</option>
                          <option value="other">Other</option>
                        </select>
                        <span className={`ds_select-arrow ${styles.selectArrow}`} aria-hidden="true"></span>
                      </div>
                    </div>

                    <div className="ds_form-group">
                      <label className="ds_label" htmlFor="message">Your Message</label>
                      <textarea
                        className="ds_input"
                        id="message"
                        name="message"
                        rows="6"
                        placeholder="Tell us how we can help you today..."
                        required
                        onFocus={handleFormInteraction}
                      ></textarea>
                    </div>
                    <div className="ds_form-group">
  <div className={checkboxStyles.checkboxContainer}>
    <input
      type="checkbox"
      id="robot"
      required
      className={checkboxStyles.hiddenInput}
    />
    <label htmlFor="robot" className={checkboxStyles.customLabel}>
      <div className={checkboxStyles.checkboxVisual}>
        <svg
          className={checkboxStyles.checkIcon}
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="m5.33 21.5 10.01 10 19-19-4-4-15 15-6-6-4.01 4z" 
            fill="#333"
          />
        </svg>
      </div>
      <span className={checkboxStyles.labelText}>I'm not a robot</span>
    </label>
  </div>
</div>

                    <button
                      className="ds_button ds_button--primary ds_!bg-sky-400 ds_!px-8"
                      type="submit"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;