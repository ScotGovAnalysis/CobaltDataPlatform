import React, { useEffect, useState } from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const Categories = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        // Fetching all groups from CKAN
        const response = await fetch(`/api/3/action/group_list`);
        if (!response.ok) {
          throw new Error('Failed to fetch groups');
        }
        const data = await response.json();
        // For each group ID, we fetch detailed information
        const detailedGroups = await Promise.all(data.result.map(async (groupId) => {
          const groupResponse = await fetch(`/api/3/action/group_show?id=${groupId}`);
          if (!groupResponse.ok) {
            throw new Error(`Failed to fetch details for group ${groupId}`);
          }
          return await groupResponse.json();
        }));
        setGroups(detailedGroups.map(group => group.result));
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchGroups();
  }, []);

  if (loading) {
    return (
      <div className="ds_page__middle">
        <div className="ds_wrapper">
          <div className="ds_loading">
            <div className="ds_loading__spinner"></div>
            <p>Loading categories...</p>
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
  
      <div className="ds_layout ds_layout--article">
        <div className="ds_layout__content">
          <header className="ds_page-header">
            <h1 className="ds_page-header__title">Categories</h1>
            <p className="ds_page-header__subtitle">
              {groups.length} categor{groups.length !== 1 ? 'ies' : 'y'} found
            </p>
          </header>
            <ul className="ds_list">
              {groups.map((group) => (
                <li key={group.id} className="ds_list__item">
                  <div className="ds_list__item-content">
                    <h2 className="ds_heading--small ds_no-margin">
                      <a href={`/category/${group.name}`} className="ds_link">{group.display_name}</a>
                    </h2>
                    <p className="ds_leader ds_text--small ds_no-margin">
                      {group.description || 'No description available'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Categories;