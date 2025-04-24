import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import { Phone, Mail, MapPin } from 'lucide-react';

const Contact = () => {
  useEffect(() => {
    // Dynamically set the page title
    document.title = "Cobalt | Contact Us";
  }, []);

  const navigate = useNavigate();
  const [showGif, setShowGif] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowGif(true);
    setTimeout(() => {
      setShowGif(false);
      navigate('/home');
    }, 5000);
  };

  return (
    <div>
      <div className="ds_page__top">
        <div className="ds_wrapper">
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">Contact us</h1>
            </header>

            <p className="ds_!text-white ds_!text-lg">The Open Data team values your feedback, questions or comments. We are always happy to hear from you.</p>
        </div>
      </div>

      <div className="ds_page__middle">
        <div className="ds_wrapper">
          {/* Using the proper sidebar layout */}
          <div className="ds_layout ds_layout--sidebar-first">
            {/* Sidebar */}
            <div className="ds_layout__sidebar">
              <aside>
                <div className="ds_!bg-gray-50 ds_!p-6 ds_!rounded-lg ds_!mb-8">
                  <h2 className="ds_h3 ds_!text-sky-600 ds_!mb-4">Quick Help</h2>
                  <ul className="ds_list ds_!mb-0">
                    <li><a href="/help" className="ds_link">Frequently Asked Questions</a></li>
                    <li><a href="/about" className="ds_link">About this site</a></li>
                  </ul>
                </div>

                <div className="ds_contact-info ds_!bg-white ds_!p-6 ds_!rounded-lg ds_!shadow-sm">
                  <h2 className="ds_h3 ds_!text-sky-600 ds_!mb-6">Ways to Reach Us</h2>

                  <div className="ds_!flex ds_!items-center ds_!mb-6">
                    <Mail className="ds_!text-sky-400 ds_!mr-3" size={24} />
                    <div>
                      <h3 className="ds_h4 ds_!mb-1">Email Us</h3>
                      <a href="mailto:statistics.opendata@gov.scot" className="ds_link">statistics.opendata@gov.scot</a>
                    </div>
                  </div>
                  <hr></hr>
                  <div className="ds_!flex ds_!items-center ds_!mb-6">
                    <Phone className="ds_!text-sky-400 ds_!mr-3" size={24} />
                    <div>
                      <h3 className="ds_h4 ds_!mb-1">Call Us</h3>
                      <a href="tel:+441234567890" className="ds_link">+44 123 456 7890</a>
                      <p className="ds_!text-sm ds_!text-gray-600 ds_!mt-1">Mon-Fri, 9am-5pm</p>
                    </div>
                  </div>
                  <hr></hr>

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

            {/* Main Content */}
            <div className="ds_layout__content">
              <main id="main-content">
                <div className="ds_!bg-white ds_!p-8 ds_!rounded-lg ds_!shadow-sm">
                  <h2 className="ds_h2 ds_!text-sky-600 ds_!mb-4">Send Us a Message</h2>
                  <p className="ds_body ds_!mb-6">We aim to get back to you within 3 days.</p>

                  <form onSubmit={handleSubmit} className="ds_form">
                    <div className="ds_!grid ds_!grid-cols-2 ds_!gap-4">
                      <div className="ds_form-group">
                        <label className="ds_label" htmlFor="name">Your Name</label>
                        <input className="ds_input" type="text" id="name" name="name" placeholder="John Smith" required />
                      </div>

                      <div className="ds_form-group">
                        <label className="ds_label" htmlFor="email">Your Email</label>
                        <input className="ds_input" type="email" id="email" name="email" placeholder="john@example.com" required />
                      </div>
                    </div>

                    <div className="ds_form-group">
                      <label className="ds_label" htmlFor="subject">Subject</label>
                      <input className="ds_input" type="text" id="subject" name="subject" placeholder="How can we help?" required />
                    </div>

                    <div className="ds_form-group">
                      <label className="ds_label" htmlFor="query-type">Type of Query</label>
                      <select className="ds_input" id="query-type" name="query-type" required>
                        <option value="">Please select...</option>
                        <option value="question">Open Data Question</option>
                        <option value="support">Technical Support</option>
                        <option value="feedback">Share Feedback</option>
                        <option value="other">Other</option>
                      </select>
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
                      ></textarea>
                    </div>

                    <div className="ds_form-group">
                      <div className="ds_checkbox">
                        <input className="ds_checkbox__input" type="checkbox" id="robot" required />
                        <label className="ds_checkbox__label" htmlFor="robot">I'm not a robot</label>
                      </div>
                    </div>

                    <button className="ds_button ds_button--primary ds_!bg-sky-400 ds_!px-8" type="submit">
                      Send Message
                    </button>
                  </form>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>

      {showGif && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '20px',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)'
        }}>
          <img src="https://media1.tenor.com/m/z0NTv7yYBtQAAAAd/oiia-cat.gif" alt="OIIA Cat" />
        </div>
      )}
    </div>
  );
};

export default Contact;
