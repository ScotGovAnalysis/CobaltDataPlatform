import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'proj4';
import 'proj4leaflet';
import styles from '../styles/Embedded_Modal.module.css';

// Fix Leaflet icon URLs
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// Define British National Grid CRS
const bngCRS = new L.Proj.CRS(
  'EPSG:27700',
  '+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs',
  {
    resolutions: [
      8192, 4096, 2048, 1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1, 0.5
    ],
    origin: [-238375.0, 1376256.0],
    bounds: L.bounds([-238375.0, 0.0], [700000.0, 1376256.0])
  }
);

const MapViewerModal = ({ isOpen, onClose, data, properties = [] }) => {
  const [transformedData, setTransformedData] = useState(null);
  const [mapCenter, setMapCenter] = useState([56.4907, -4.2026]); // Default to Scotland
  const [mapZoom, setMapZoom] = useState(6); // Default zoom level

  // Transform GeoJSON data to WGS84 (latitude/longitude)
  useEffect(() => {
    if (data && data.features) {
      const transformedGeoJson = JSON.parse(JSON.stringify(data));
      const bounds = new L.LatLngBounds();

      transformedGeoJson.features = transformedGeoJson.features.map(feature => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates = coords.map(coord => {
            const point = L.point(coord[0], coord[1]);
            const latLng = bngCRS.unproject(point);
            bounds.extend(latLng);
            return [latLng.lng, latLng.lat];
          });
        }
        return feature;
      });

      setTransformedData(transformedGeoJson);

      // Set map center and zoom based on bounds
      if (bounds.isValid()) {
        const center = bounds.getCenter();
        setMapCenter([center.lat, center.lng]);
        setMapZoom(bounds.getNorthEast().distanceTo(bounds.getSouthWest()) > 5000 ? 10 : 13);
      }
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
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          {!transformedData ? (
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
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <GeoJSON
                data={transformedData}
                style={{
                  color: '#3388ff',
                  weight: 2,
                  opacity: 0.7
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
