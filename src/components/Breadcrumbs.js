const Breadcrumbs = ({ dataset }) => (
    <nav aria-label="Breadcrumb">
      <ol className="ds_breadcrumbs">
        <li className="ds_breadcrumbs__item">
          <a href="/" className="ds_breadcrumbs__link">Home</a>
        </li>
        <li className="ds_breadcrumbs__item">
          <a href="/datasets" className="ds_breadcrumbs__link">Datasets</a>
        </li>
        <li className="ds_breadcrumbs__item">
          <span className="ds_breadcrumbs__link ds_breadcrumbs__link--current">
            {dataset.title}
          </span>
        </li>
      </ol>
    </nav>
  );
  
  export default Breadcrumbs;