const Tabs = ({ activeTab, setActiveTab, resourceFormat }) => (
    <div className="ds_tabs" data-module="ds-tabs">
      <nav className="ds_tabs__navigation" aria-labelledby="ds_tabs__title">
        <h2 id="ds_tabs__title" className="ds_tabs__title">Dataset Contents</h2>
        <ul className="ds_tabs__list" id="tablist">
          <li className="ds_tabs__tab">
            <a
              className={`ds_tabs__tab-link ${activeTab === 'overview' ? 'ds_tabs__tab-link--current' : ''}`}
              href="#overview"
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </a>
          </li>
          {resourceFormat === 'csv' && (
            <>
              <li className="ds_tabs__tab">
                <a
                  className={`ds_tabs__tab-link ${activeTab === 'data' ? 'ds_tabs__tab-link--current' : ''}`}
                  href="#data"
                  onClick={() => setActiveTab('data')}
                >
                  Data
                </a>
              </li>
              <li className="ds_tabs__tab">
                <a
                  className={`ds_tabs__tab-link ${activeTab === 'analyse' ? 'ds_tabs__tab-link--current' : ''}`}
                  href="#analyse"
                  onClick={() => setActiveTab('analyse')}
                >
                  Analyse
                </a>
              </li>
            </>
          )}
          {resourceFormat === 'geojson' && (
            <li className="ds_tabs__tab">
              <a
                className={`ds_tabs__tab-link ${activeTab === 'map' ? 'ds_tabs__tab-link--current' : ''}`}
                href="#map"
                onClick={() => setActiveTab('map')}
              >
                Map View
              </a>
            </li>
          )}
        </ul>
      </nav>
    </div>
  );
  
  export default Tabs;