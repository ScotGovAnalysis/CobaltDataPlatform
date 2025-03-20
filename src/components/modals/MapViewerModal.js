import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from '../../styles/Embedded_Modal.module.css';

// Fix Leaflet icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Custom component to fit map to bounds
const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
};

const MapViewerModal = ({ isOpen, onClose, data, properties = [] }) => {
  const [mapBounds, setMapBounds] = useState(null);
  const [mapCenter, setMapCenter] = useState([55.8600, -4.2500]); // Center on Glasgow
  const [mapZoom, setMapZoom] = useState(12); // Zoom level for city view

  // Calculate bounds from GeoJSON data
  useEffect(() => {
    if (data && data.features && data.features.length > 0) {
      console.log('GeoJSON Data:', data); // Debug: Log the data
      const bounds = new L.LatLngBounds();
      let hasValidGeometry = false;

      data.features.forEach((feature, index) => {
        if (feature.geometry && feature.geometry.coordinates) {
          const geometry = feature.geometry;
          hasValidGeometry = true;
          console.log(`Feature ${index} Geometry:`, geometry); // Debug: Log each geometry

          if (geometry.type === 'Point') {
            bounds.extend([geometry.coordinates[1], geometry.coordinates[0]]);
          } else if (geometry.type === 'LineString' || geometry.type === 'MultiPoint') {
            geometry.coordinates.forEach(coord => bounds.extend([coord[1], coord[0]]));
          } else if (geometry.type === 'Polygon' || geometry.type === 'MultiLineString') {
            geometry.coordinates.forEach(ring => ring.forEach(coord => bounds.extend([coord[1], coord[0]])));
          } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon =>
              polygon.forEach(ring => ring.forEach(coord => bounds.extend([coord[1], coord[0]])))
            );
          }
        } else {
          console.warn(`Feature ${index} has no valid geometry`);
        }
      });

      if (hasValidGeometry && bounds.isValid()) {
        console.log('Calculated Bounds:', bounds.toBBoxString()); // Debug: Log bounds
        setMapBounds(bounds);
      } else {
        console.error('No valid geometries found in GeoJSON data');
      }
    } else {
      console.error('Invalid or empty GeoJSON data:', data);
    }
  }, [data]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>Map Viewer</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBody} style={{ padding: 0 }}>
          {!data || !data.features ? (
            <p>Processing map data...</p>
          ) : (
            <MapContainer
              style={{ width: '100%', height: '100%' }}
              center={mapCenter}
              zoom={mapZoom}
              scrollWheelZoom={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {mapBounds && <FitBounds bounds={mapBounds} />}
              <GeoJSON
                data={data}
                style={{
                  color: '#3388ff',
                  weight: 2,
                  opacity: 0.7,
                }}
                onEachFeature={(feature, layer) => {
                  if (feature.properties) {
                    const popupContent = properties
                      .map(prop => `${prop}: ${feature.properties[prop]}`)
                      .join('<br>');
                    layer.bindPopup(popupContent);
                  }
                }}
              />
            </MapContainer>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapViewerModal;