"use client";

import { useState, useEffect } from "react"; // Add useEffect
import { MapContainer, TileLayer, Marker, Popup, Circle, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

export default function LocationMap({ 
  latitude, 
  longitude, 
  title,
  accuracy = 100,
  theme = "modern",
  markerColor = "#3B82F6",
}) {
  const position = [latitude, longitude];
  const [mapTheme, setMapTheme] = useState(theme);
  const [isMounted, setIsMounted] = useState(false); // Add mounted state

  useEffect(() => {
    setIsMounted(true); // Set to true after mount
  }, []);

  const tiles = {
    modern: {
      url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    },
    dark: {
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/attributions">CARTO</a>',
    },
    satellite: {
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: 'Tiles © Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
    },
  };

  if (!isMounted || !latitude || !longitude) return null; // Prevent render until mounted

  return (
    <div className="relative rounded-xl overflow-hidden shadow-lg">
      <div className="absolute top-4 right-4 z-10 bg-white dark:bg-gray-800 rounded-lg shadow-md p-1 flex space-x-1">
        {Object.keys(tiles).map((key) => (
          <button
            key={key}
            className={`px-2 py-1 text-xs rounded-md transition-all ${
              mapTheme === key ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
            }`}
            onClick={() => setMapTheme(key)}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </button>
        ))}
      </div>

      <MapContainer
        center={position}
        zoom={14}
        style={{ height: "400px", width: "100%" }}
        zoomControl={false}
        className="z-0"
      >
        <TileLayer
          url={tiles[mapTheme].url}
          attribution={tiles[mapTheme].attribution}
        />
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: markerColor,
            fillColor: markerColor,
            fillOpacity: 0.1,
            weight: 1,
          }}
        />
        <Marker position={position}>
          <Popup className="rounded-lg shadow-lg">
            <div className="py-1">
              <h3 className="font-medium text-gray-900">{title}</h3>
              <div className="mt-1 text-sm text-gray-500">
                <p>Lat: {latitude.toFixed(6)}</p>
                <p>Lng: {longitude.toFixed(6)}</p>
              </div>
            </div>
          </Popup>
        </Marker>
        <ZoomControl position="bottomright" />
      </MapContainer>

      <div className="absolute left-4 bottom-4 z-10 bg-white dark:bg-gray-800 bg-opacity-90 dark:bg-opacity-90 rounded-lg p-3 shadow-lg max-w-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h3>
        </div>
        <div className="flex items-center mt-1">
          <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
          <span className="text-xs text-gray-600 dark:text-gray-300">Live tracking</span>
        </div>
      </div>
    </div>
  );
}