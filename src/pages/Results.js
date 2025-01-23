import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Results = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Dynamic filter states
  const [selectedOrganizations, setSelectedOrganizations] = useState([]);
  const [selectedResourceTypes, setSelectedResourceTypes] = useState([]);

  // Derived filter options
  const [organizationOptions, setOrganizationOptions] = useState([]);
  const [resourceTypeOptions, setResourceTypeOptions] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await fetch(`/api/3/action/package_search?q=${searchQuery}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        const fetchedResults = data.result.results;
        setResults(fetchedResults);

        // Dynamically extract unique organizations
        const uniqueOrgs = Array.from(new Set(
          fetchedResults
            .map(result => result.organization?.title)
            .filter(org => org)
        ));
        setOrganizationOptions(uniqueOrgs);

        // Dynamically extract unique resource formats
        const uniqueFormats = Array.from(new Set(
          fetchedResults
            .flatMap(result => 
              result.resources 
                ? result.resources.map(resource => resource.format) 
                : []
            )
            .filter(format => format)
        ));
        setResourceTypeOptions(uniqueFormats);

        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchResults();
    }
  }, [searchQuery]);

  const handleOrganizationFilter = (org) => {
    setSelectedOrganizations(prev => 
      prev.includes(org) 
        ? prev.filter(item => item !== org)
        : [...prev, org]
    );
  };

  const handleResourceTypeFilter = (type) => {
    setSelectedResourceTypes(prev => 
      prev.includes(type) 
        ? prev.filter(item => item !== type)
        : [...prev, type]
    );
  };

  const filteredResults = results.filter(result => {
    const orgMatch = selectedOrganizations.length === 0 || 
      selectedOrganizations.includes(result.organization?.title);
    
    const resourceMatch = selectedResourceTypes.length === 0 || 
      (result.resources && 
       result.resources.some(resource => 
         selectedResourceTypes.includes(resource.format)
       ));
    
    return orgMatch && resourceMatch;
  });

  // Count results for each filter option
  const getOrganizationCounts = () => {
    return organizationOptions.map(org => ({
      name: org,
      count: results.filter(result => result.organization?.title === org).length
    }));
  };

  const getResourceTypeCounts = () => {
    return resourceTypeOptions.map(format => ({
      name: format,
      count: results.filter(result => 
        result.resources && 
        result.resources.some(resource => resource.format === format)
      ).length
    }));
  };

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading results...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_error">
            <p>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ds_page__middle">
      <div className="ds_wrapper">
        {/* Use ds_layout with proper structure */}
        <div className="ds_layout ds_layout--article">
          {/* Sidebar with Filters (LEFT SIDE) */}
          <div className="ds_layout__sidebar">
            <div className="ds_search-filters">
              <h2 className="ds_search-filters__title">Filters</h2>
              
              {/* Organization Filter */}
              <div className="ds_accordion ds_accordion--small">
                <div className="ds_accordion-item">
                  <input 
                    type="checkbox" 
                    className="visually-hidden ds_accordion-item__control" 
                    id="organization-panel"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">Organization</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label 
                      className="ds_accordion-item__label" 
                      htmlFor="organization-panel"
                    >
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <div className="ds_search-filters__checkboxes">
                      {getOrganizationCounts().map(org => (
                        <div key={org.name} className="ds_checkbox ds_checkbox--small">
                          <input
                            id={`org-${org.name}`}
                            type="checkbox"
                            className="ds_checkbox__input"
                            checked={selectedOrganizations.includes(org.name)}
                            onChange={() => handleOrganizationFilter(org.name)}
                          />
                          <label 
                            htmlFor={`org-${org.name}`} 
                            className="ds_checkbox__label"
                          >
                            {org.name} 
                            <span className="badge ml-2"> ({org.count})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resource Type Filter */}
              <div className="ds_accordion ds_accordion--small">
                <div className="ds_accordion-item">
                  <input 
                    type="checkbox" 
                    className="visually-hidden ds_accordion-item__control" 
                    id="resource-panel"
                  />
                  <div className="ds_accordion-item__header">
                    <h3 className="ds_accordion-item__title">Data Format</h3>
                    <span className="ds_accordion-item__indicator"></span>
                    <label 
                      className="ds_accordion-item__label" 
                      htmlFor="resource-panel"
                    >
                      <span className="visually-hidden">Show this section</span>
                    </label>
                  </div>
                  <div className="ds_accordion-item__body">
                    <div className="ds_search-filters__checkboxes">
                      {getResourceTypeCounts().map(type => (
                        <div key={type.name} className="ds_checkbox ds_checkbox--small">
                          <input
                            id={`type-${type.name}`}
                            type="checkbox"
                            className="ds_checkbox__input"
                            checked={selectedResourceTypes.includes(type.name)}
                            onChange={() => handleResourceTypeFilter(type.name)}
                          />
                          <label 
                            htmlFor={`type-${type.name}`} 
                            className="ds_checkbox__label"
                          >
                            {type.name} 
                            <span className="badge ml-2"> ({type.count})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content (RIGHT SIDE) */}
          <div className="ds_layout__content">
            <div className="ds_search-results">
              <header className="ds_page-header">
                <h1 className="ds_page-header__title">Search Results</h1>
                <p className="ds_page-header__subtitle">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''} found
                </p>
              </header>

              <ol className="ds_search-results__list">
                {filteredResults.map((result) => (
                  <li key={result.id} className="ds_search-result">
                    <h2 className="ds_search-result__title">
                      <Link 
                        to={`/dataset/${result.name}`} 
                        className="ds_search-result__link"
                      >
                        {result.title}
                      </Link>
                    </h2>
                    <p className="ds_search-result__summary">
                      {result.notes || 'No description available'}
                    </p>
                    <dl className="ds_search-result__metadata ds_metadata ds_metadata--inline">
                      <div className="ds_metadata__item">
                        <dt className="ds_metadata__key">Organization</dt>
                        <dd className="ds_metadata__value">
                          {result.organization?.title || 'Unknown'}
                        </dd>
                      </div>
                      {result.resources && result.resources.length > 0 && (
                        <div className="ds_metadata__item">
                          <dt className="ds_metadata__key">Resource Types</dt>
                          <dd className="ds_metadata__value">
                            {result.resources.map(resource => resource.format).join(', ')}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;