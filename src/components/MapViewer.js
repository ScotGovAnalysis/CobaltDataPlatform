import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'proj4';
import 'proj4leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

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

const MapViewer = ({ data, properties = [] }) => {
  const [transformedData, setTransformedData] = useState(null);

  useEffect(() => {
    if (data && data.features) {
      console.log('Original CRS:', data.crs);
      const transformedGeoJson = JSON.parse(JSON.stringify(data));
      transformedGeoJson.features = transformedGeoJson.features.map(feature => {
        const coords = feature.geometry.coordinates;
        if (feature.geometry.type === 'LineString') {
          feature.geometry.coordinates = coords.map(coord => {
            const point = L.point(coord[0], coord[1]);
            const latLng = bngCRS.unproject(point);
            return [latLng.lng, latLng.lat];
          });
        }
        return feature;
      });
      console.log('Transformed first feature:', transformedGeoJson.features[0]);
      setTransformedData(transformedGeoJson);
    }
  }, [data]);

  if (!transformedData) {
    return <div>Processing map data...</div>;
  }

  return (
    <div style={{ width: '100%', height: '500px', position: 'relative', border: '1px solid #ccc' }}>
      <MapContainer
        style={{ width: '100%', height: '100%' }}
        center={[56.4907, -4.2026]}
        zoom={6}
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
    </div>
  );
};

export default MapViewer;