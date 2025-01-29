  import Papa from 'papaparse';
  import { flattenObject } from 'lodash';
  
  export const calculateMode = (values) => {
    const frequencyMap = {};
    values.forEach(val => {
      frequencyMap[val] = (frequencyMap[val] || 0) + 1;
    });
  
    const maxFrequency = Math.max(...Object.values(frequencyMap));
  
    // Only return mode if it appears more than once and is the only value with max frequency
    const modes = Object.entries(frequencyMap)
      .filter(([_, count]) => count === maxFrequency)
      .map(([val, _]) => val);
  
    return modes.length === 1 ? Number(modes[0]) : null;
  };
  

export const parseDataset = async (resource) => {
  const { format, url } = resource;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    switch (format.toLowerCase()) {
      case 'csv':
        const csvText = await response.text();
        return parseCsvData(csvText);
        
      case 'json':
        const jsonData = await response.json();
        return parseJsonData(jsonData);
        
      case 'geojson':
        const geojsonData = await response.json();
        return parseGeoJsonData(geojsonData);
        
      default:
        throw new Error(`Unsupported format: ${format}`);
    }
  } catch (error) {
    console.error('Error parsing dataset:', error);
    throw error;
  }
};

const parseCsvData = (csvText) => {
  return new Promise((resolve) => {
    Papa.parse(csvText, {
      header: true,
      complete: (results) => {
        resolve({
          data: results.data,
          columns: results.meta.fields,
          type: 'tabular'
        });
      }
    });
  });
};

const parseJsonData = (jsonData) => {
  // Handle both array and object formats
  const dataArray = Array.isArray(jsonData) ? jsonData : [jsonData];
  
  // Flatten nested structures
  const flattenedData = dataArray.map(item => flattenObject(item));
  
  // Extract unique columns
  const columns = Array.from(
    new Set(flattenedData.flatMap(item => Object.keys(item)))
  );
  
  return {
    data: flattenedData,
    columns,
    type: 'tabular'
  };
};

const parseGeoJsonData = (geojsonData) => {
  // Extract properties from features for tabular view
  const features = geojsonData.features || [];
  const flattenedData = features.map(feature => ({
    ...flattenObject(feature.properties),
    geometry_type: feature.geometry?.type,
    coordinates: JSON.stringify(feature.geometry?.coordinates)
  }));
  
  const columns = Array.from(
    new Set(flattenedData.flatMap(item => Object.keys(item)))
  );
  
  return {
    data: flattenedData,
    columns,
    type: 'geospatial',
    geojson: geojsonData
  };
};