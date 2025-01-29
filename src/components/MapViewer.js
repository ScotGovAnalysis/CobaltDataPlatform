import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MapViewer = ({ data, properties = [] }) => {
  const mapRef = useRef();
  const geojsonRef = useRef();

  useEffect(() => {
    if (geojsonRef.current && mapRef.current) {
      const bounds = geojsonRef.current.getBounds();
      mapRef.current.fitBounds(bounds);
    }
  }, [data]);

  const getFeatureStyle = (feature) => {
    return {
      fillColor: '#3388ff',
      weight: 2,
      opacity: 1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature, layer) => {
    if (feature.properties) {
      const popupContent = properties
        .map(prop => `${prop}: ${feature.properties[prop]}`)
        .join('<br>');
      layer.bindPopup(popupContent);
    }
  };

  return (
    <div className="w-full h-96">
      <MapContainer
        ref={mapRef}
        className="w-full h-full"
        center={[0, 0]}
        zoom={2}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <GeoJSON
          ref={geojsonRef}
          data={data}
          style={getFeatureStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>
    </div>
  );
};

export default MapViewer;