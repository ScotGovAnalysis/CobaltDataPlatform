import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Design_Style.module.css';

const DataDictionary = ({ dataset, resourceId, config }) => {
  const [dataDictionary, setDataDictionary] = useState([]);
  const [loadingDictionary, setLoadingDictionary] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [geoJsonStructure, setGeoJsonStructure] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});

  useEffect(() => {
    if (!dataset || dataDictionary.length > 0) return;
    fetchDataDictionary();
  }, [dataset, resourceId, config]);

  const fetchDataDictionary = async () => {
    setLoadingDictionary(true);
    try {
      const resource = dataset.resources.find((r) => r.id === resourceId);

      if (resource.format.toLowerCase() === 'geojson' || resource.format.toLowerCase() === 'json') {
        const response = await fetch(resource.url);
        if (!response.ok) throw new Error('Failed to fetch JSON data');

        const jsonData = await response.json();
        setGeoJsonStructure(parseJsonStructure(jsonData));
      } else if (resource.format.toLowerCase() === 'csv') {
        try {
          const datastoreResponse = await fetch(
            `${config.apiBaseUrl}/api/3/action/datastore_search?resource_id=${resource.id}&limit=0`
          );
          const datastoreResult = await datastoreResponse.json();

          if (datastoreResult.success) {
            const fields = datastoreResult.result.fields;
            const dictionary = fields.map((field) => ({
              name: field.id,
              type: field.type,
              description: field.info?.notes || 'No description available',
            }));
            setDataDictionary(dictionary);
            return;
          }
        } catch (datastoreError) {
          console.log('No datastore info available, falling back to CSV parsing');
        }

        try {
          const headerResponse = await fetch(resource.url, {
            headers: { Range: 'bytes=0-10240' },
          });

          const text = await headerResponse.text();
          const firstNewLine = text.indexOf('\n');
          const headerLine = firstNewLine > 0 ? text.substring(0, firstNewLine) : text;
          const headers = headerLine.split(',').map((h) => h.trim());

          const dictionary = headers.map((header) => ({
            name: header,
            type: 'unknown',
            description: 'No description available',
          }));

          setDataDictionary(dictionary);
        } catch (headerError) {
          console.error('Error loading headers:', headerError);
          const fullResponse = await fetch(resource.url);
          const text = await fullResponse.text();
          const rows = text.split('\n').filter((row) => row.trim() !== '');
          const headers = rows[0]?.split(',').map((h) => h.trim()) || [];

          const dictionary = headers.map((header) => ({
            name: header,
            type: 'unknown',
            description: 'No description available',
          }));

          setDataDictionary(dictionary);
        }
      }
    } catch (err) {
      console.error('Error fetching data dictionary:', err);
    } finally {
      setLoadingDictionary(false);
    }
  };

  const parseJsonStructure = (jsonData) => {
    const parseObject = (obj) => {
      return Object.keys(obj).map((key) => {
        const value = obj[key];
        const isArray = Array.isArray(value);
        const isObject = typeof value === 'object' && value !== null && !isArray;

        return {
          name: key,
          type: isArray ? 'Array' : isObject ? 'Object' : typeof value,
          description: isArray ? 'Array' : isObject ? 'Object' : 'Primitive',
          children: isObject ? parseObject(value) : null,
        };
      });
    };

    if (Array.isArray(jsonData)) {
      return [
        {
          name: 'Root Array',
          type: 'Array',
          description: 'Array',
          children: jsonData.length > 0 ? parseObject(jsonData[0]) : null,
        },
      ];
    } else if (typeof jsonData === 'object' && jsonData !== null) {
      return parseObject(jsonData);
    }

    return [];
  };

  const handleToggleDictionary = () => {
    if (!dataDictionary.length && !loadingDictionary && !geoJsonStructure) {
      fetchDataDictionary();
    }
    setIsDictionaryOpen(!isDictionaryOpen);
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="ds_accordion" style={{ width: '100%', marginTop: '2rem' }}>
      <div className="ds_accordion-item">
        <input
          type="checkbox"
          id="data-dictionary-accordion"
          className={`visually-hidden ds_accordion-item__control ${styles.accordionItemControl}`}
          checked={isDictionaryOpen}
          onChange={handleToggleDictionary}
        />
        <div className={`ds_accordion-item__header ${styles.accordionItemHeader}`}>
          <h3 className="ds_accordion-item__title">
            Data Dictionary
            {loadingDictionary && (
              <span
                className="ds_loading__spinner"
                style={{ marginLeft: '1rem', width: '1.5rem', height: '1.5rem' }}
              ></span>
            )}
          </h3>
          <span className={styles.accordionIndicator}></span>
          <label className="ds_accordion-item__label" htmlFor="data-dictionary-accordion">
            <span className="visually-hidden">Show this section</span>
          </label>
        </div>
        <div className="ds_accordion-item__body">
          <div className={styles.tableWrapper}>
            {geoJsonStructure ? (
              <div>
                <h4>JSON Structure</h4>
                <table className={styles.tableModern}>
                  <thead>
                    <tr>
                      <th>Field Name</th>
                      <th>Type</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {geoJsonStructure.map((item, index) => (
                      <React.Fragment key={index}>
                        <tr
                          className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${
                            expandedRows[index] ? styles.expandedRow : ''
                          }`}
                          onClick={() => toggleRow(index)}
                        >
                          <td>
                            <span className={styles.fieldName}>
                              {item.name} {item.children && <span className={styles.toggleIcon}>▶</span>}
                            </span>
                          </td>
                          <td>
                            <span className={styles.typeBadge}>{item.type}</span>
                          </td>
                          <td>{item.description}</td>
                        </tr>
                        {expandedRows[index] &&
                          item.children &&
                          item.children.map((child, idx) => (
                            <tr key={idx} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                              <td style={{ paddingLeft: '20px' }}>
                                <span className={styles.fieldName}>{child.name}</span>
                              </td>
                              <td>
                                <span className={styles.typeBadge}>{child.type}</span>
                              </td>
                              <td>{child.description}</td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : dataDictionary.length > 0 ? (
              <table className={styles.tableModern}>
                <thead>
                  <tr>
                    <th>Field Name</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {dataDictionary
                    .filter((field) => field.name !== '_id')
                    .map((field, index) => (
                      <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td>
                          <span className={styles.fieldName}>{field.name}</span>
                        </td>
                        <td>
                          <span className={styles.typeBadge}>{field.type}</span>
                        </td>
                        <td>{field.description}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            ) : (
              !loadingDictionary && <p className="ds_message ds_message--info">No data dictionary available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

DataDictionary.propTypes = {
  dataset: PropTypes.object.isRequired,
  resourceId: PropTypes.string.isRequired,
  config: PropTypes.object.isRequired,
};

export default DataDictionary;