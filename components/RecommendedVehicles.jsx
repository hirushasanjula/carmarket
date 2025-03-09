"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function RecommendedVehicles({ currentVehicleId }) {
  const [recommendedVehicles, setRecommendedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!session?.user) {
        setLoading(false);
        return; // Skip fetching if not logged in
      }

      try {
        setLoading(true);
        const response = await fetch("/api/recommendations");
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        const data = await response.json();
        setRecommendedVehicles(Array.isArray(data) ? data.filter(v => v._id !== currentVehicleId) : []);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [session, currentVehicleId]);

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Vehicles</h2>
        <p className="text-gray-600">Loading recommendations...</p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recommended Vehicles</h2>
      {recommendedVehicles.length === 0 ? (
        <p className="text-gray-600">No recommendations available yet. Keep exploring!</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendedVehicles.map((recVehicle) => (
            <Link
              key={recVehicle._id}
              href={`/vehicles/${recVehicle._id}`}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              <img
                src={recVehicle.images && recVehicle.images.length > 0 ? recVehicle.images[0] : "/api/placeholder/400/300"}
                alt={recVehicle.model}
                className="w-full h-48 object-cover"
                onError={(e) => { e.target.src = "/api/placeholder/400/300"; e.target.onerror = null; }}
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900">{recVehicle.year} {recVehicle.model}</h3>
                <p className="text-xl font-bold text-blue-600">Rs. {formatPrice(recVehicle.price)}</p>
                <p className="text-sm text-gray-600">Type: {recVehicle.vehicle_type}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}