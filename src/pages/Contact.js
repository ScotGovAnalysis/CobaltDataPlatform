import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Contact = () => {
  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        <main id="main-content">
        <label class="ds_label" for="description">Description</label>
        <textarea class="ds_input" rows="3" id="description" name="description"></textarea>
        </main>
      </div>
    </div>
  );
};

export default Contact;