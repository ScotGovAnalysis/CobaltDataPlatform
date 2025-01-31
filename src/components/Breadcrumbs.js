import React from 'react';
import { Link } from 'react-router-dom';

const Breadcrumbs = ({ dataset, resourceId }) => (
  <nav aria-label="Breadcrumb">
    <ol className="ds_breadcrumbs">
      <li className="ds_breadcrumbs__item">
        <Link to="/" className="ds_breadcrumbs__link">Home</Link>
      </li>
      <li className="ds_breadcrumbs__item">
        <Link to="/datasets" className="ds_breadcrumbs__link">Datasets</Link>
      </li>
      <li className="ds_breadcrumbs__item">
        <Link to={`/dataset/${dataset.id}`} className="ds_breadcrumbs__link">
          {dataset.title}
        </Link>
      </li>
      <li className="ds_breadcrumbs__item">
        <span className="ds_breadcrumbs__link ds_breadcrumbs__link--current">
          Data Explorer
        </span>
      </li>
    </ol>
  </nav>
);

export default Breadcrumbs;