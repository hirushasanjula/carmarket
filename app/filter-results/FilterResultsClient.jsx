"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FilterResultsClient() {
  const searchParams = useSearchParams();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFilteredVehicles = async () => {
      try {
        setLoading(true);
        const query = searchParams.toString();
        const response = await fetch(`/api/vehicles?showAll=true&${query}`);
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch filtered results: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setVehicles(data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    fetchFilteredVehicles();
  }, [searchParams]);

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
  if (vehicles.length === 0) return <div className="text-center py-8">No vehicles match your filters</div>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {vehicles.map((vehicle) => (
        <Link
          key={vehicle._id}
          href={`/vehicle-detail/${vehicle._id}`}
          className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
        >
          <img
            src={getMainImage(vehicle)}
            alt={vehicle.model}
            className="w-full h-40 object-cover"
            onError={(e) => {
              e.target.src = "/api/placeholder/400/300";
            }}
          />
          <div className="p-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {vehicle.year} {vehicle.model}
            </h2>
            <p className="text-sm text-gray-600">${formatPrice(vehicle.price)}</p>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{vehicle.vehicle_type}</span>
              <span>{vehicle.fuelType || "N/A"}</span>
              <span>{vehicle.location.city}, {vehicle.location.region}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}