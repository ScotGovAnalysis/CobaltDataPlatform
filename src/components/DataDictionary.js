import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from '../styles/Design_Style.module.css';

const DataDictionary = ({ dataset, resourceId, config }) => {
  const [dataDictionary, setDataDictionary] = useState([]);
  const [loadingDictionary, setLoadingDictionary] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [geoJsonStructure, setGeoJsonStructure] = useState(null);
  const [expandedRows, setExpandedRows] = useState({});
  const accordionLabelRef = useRef(null);

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
    const parseObject = (obj, level = 0) => {
      return Object.keys(obj).map((key) => {
        const value = obj[key];
        const isArray = Array.isArray(value);
        const isObject = typeof value === 'object' && value !== null && !isArray;

        return {
          name: key,
          type: isArray ? 'Array' : isObject ? 'Object' : typeof value,
          description: isArray ? 'Array' : isObject ? 'Object' : 'Primitive',
          children: isObject ? parseObject(value, level + 1) : null,
          level,
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
          level: 0,
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

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleToggleDictionary();
    }
  };

  const toggleRow = (index) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderRows = (items) => {
    return items.map((item, index) => (
      <React.Fragment key={index}>
        <tr
          className={`${index % 2 === 0 ? styles.evenRow : styles.oddRow} ${
            expandedRows[index] ? styles.expandedRow : ''
          }`}
          onClick={() => toggleRow(index)}
        >
          <td style={{ wordBreak: 'break-word', paddingLeft: `${item.level * 20}px` }}>
            <span className={styles.fieldName}>
              {item.name} {item.children && <span className={styles.toggleIcon}>▶</span>}
            </span>
          </td>
          <td style={{ wordBreak: 'break-word' }}>
            <span className={styles.typeBadge}>{item.type}</span>
          </td>
          <td style={{ wordBreak: 'break-word' }}>{item.description}</td>
        </tr>
        {expandedRows[index] && item.children && renderRows(item.children)}
      </React.Fragment>
    ));
  };

  return (
    <div
      className="ds_accordion"
      style={{ width: '100%', maxWidth: '100%', marginTop: '2rem', boxSizing: 'border-box' }}
    >
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
          <label
            className="ds_accordion-item__label"
            htmlFor="data-dictionary-accordion"
            ref={accordionLabelRef}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            role="button"
            aria-expanded={isDictionaryOpen}
            aria-controls="data-dictionary-body"
          >
            <span className="visually-hidden">Toggle data dictionary</span>
          </label>
        </div>
        <div className="ds_accordion-item__body" id="data-dictionary-body">
          <div
            className={styles.tableWrapper}
            style={{ width: '100%', maxWidth: '100%', overflowX: 'auto', boxSizing: 'border-box' }}
          >
            {geoJsonStructure ? (
              <div>
                <h4>JSON Structure</h4>
                <table
                  className={`${styles.tableModern} ${styles.smallFont}`}
                  style={{
                    width: '100%',
                    maxWidth: '100%',
                    borderRadius: 0,
                    tableLayout: 'auto',
                    boxSizing: 'border-box',
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ wordBreak: 'break-word' }}>Field Name</th>
                      <th style={{ wordBreak: 'break-word' }}>Type</th>
                      <th style={{ wordBreak: 'break-word' }}>Description</th>
                    </tr>
                  </thead>
                  <tbody>{renderRows(geoJsonStructure)}</tbody>
                </table>
              </div>
            ) : dataDictionary.length > 0 ? (
              <table
                className={`${styles.tableModern} ${styles.smallFont}`}
                style={{
                  width: '100%',
                  maxWidth: '100%',
                  borderRadius: 0,
                  tableLayout: 'auto',
                  boxSizing: 'border-box',
                }}
              >
                <thead>
                  <tr>
                    <th style={{ wordBreak: 'break-word' }}>Field Name</th>
                    <th style={{ wordBreak: 'break-word' }}>Type</th>
                    <th style={{ wordBreak: 'break-word' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {dataDictionary
                    .filter((field) => field.name !== '_id')
                    .map((field, index) => (
                      <tr key={index} className={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                        <td style={{ wordBreak: 'break-word' }}>
                          <span className={styles.fieldName}>{field.name}</span>
                        </td>
                        <td style={{ wordBreak: 'break-word' }}>
                          <span className={styles.typeBadge}>{field.type}</span>
                        </td>
                        <td style={{ wordBreak: 'break-word' }}>{field.description}</td>
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
