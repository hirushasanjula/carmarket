"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Link from "next/link";

// Fix Leaflet marker icons (only run in browser)
if (typeof window !== "undefined") {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

export default function VehicleMap({ vehicles = [] }) {
  const center = [7.8731, 80.7718]; // Center of Sri Lanka
  console.log("VehicleMap rendering, vehicles:", vehicles);

  if (!vehicles.length) {
    console.log("No vehicles provided");
    return <p className="text-gray-600">No vehicles to display</p>;
  }

  const validVehicles = vehicles.filter((vehicle) => {
    const hasValidCoords =
      vehicle.location?.coordinates?.coordinates &&
      vehicle.location.coordinates.coordinates[0] !== 0 &&
      vehicle.location.coordinates.coordinates[1] !== 0;
    if (!hasValidCoords) console.log("Invalid coordinates:", vehicle);
    return hasValidCoords;
  });

  if (!validVehicles.length) {
    console.log("No valid vehicle coordinates");
    return <p className="text-gray-600">No valid locations</p>;
  }

  return (
    <MapContainer center={center} zoom={7} style={{ height: "300px", width: "100%" }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      {validVehicles.map((vehicle) => (
        <Marker
          key={vehicle._id}
          position={[
            vehicle.location.coordinates.coordinates[1], // Latitude
            vehicle.location.coordinates.coordinates[0], // Longitude
          ]}
        >
          <Popup>
            <div>
              <h3 className="font-bold">{vehicle.year} {vehicle.model}</h3>
              <p>Rs. {vehicle.price.toLocaleString()}</p>
              <p>{vehicle.location.city}, {vehicle.location.region}</p>
              <Link href={`/vehicles/${vehicle._id}`} className="text-blue-600 hover:underline">
                View Details
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}