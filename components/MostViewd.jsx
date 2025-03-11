"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Fuel, Gauge, ArrowRight, Heart, Car } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

const MostViewedVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovering, setIsHovering] = useState(null);

  useEffect(() => {
    fetchMostViewedVehicles();
    fetchSavedVehicles();
  }, []);

  const fetchMostViewedVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vehicles?showAll=true");
      if (!response.ok) throw new Error(`Failed to fetch vehicles: ${response.status}`);
      const data = await response.json();

      // Sort by views and take top 4
      const topViewedVehicles = Array.isArray(data)
        ? data
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 4) // Limit to top 4 most viewed
        : [];

      setVehicles(topViewedVehicles);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching most viewed vehicles:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchSavedVehicles = async () => {
    try {
      const response = await fetch("/api/saved-vehicles");
      if (!response.ok) return; // Skip if not logged in
      const data = await response.json();
      setSavedVehicles(data.map((sv) => sv.vehicle._id));
    } catch (error) {
      console.error("Error fetching saved vehicles:", error);
    }
  };

  const handleBookmark = async (vehicleId, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      const isSaved = savedVehicles.includes(vehicleId);
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch("/api/saved-vehicles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
      });
      if (!response.ok) throw new Error(`Failed to ${isSaved ? "remove" : "save"} vehicle`);
      setSavedVehicles((prev) =>
        isSaved ? prev.filter((id) => id !== vehicleId) : [...prev, vehicleId]
      );
    } catch (error) {
      setError(error.message);
    }
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";
  const isNewListing = (createdAt) => {
    if (!createdAt) return false;
    const differenceInDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return differenceInDays < 7;
  };

  // Vehicle Card Skeleton component
  const VehicleCardSkeleton = () => (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full animate-pulse">
      <div className="h-40 bg-gray-100"></div>
      <div className="p-3">
        <div className="mb-2">
          <div className="h-5 bg-gray-100 rounded w-3/4 mb-1"></div>
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3">
          <div className="h-3 bg-gray-100 rounded"></div>
          <div className="h-3 bg-gray-100 rounded"></div>
          <div className="h-3 bg-gray-100 rounded"></div>
          <div className="h-3 bg-gray-100 rounded"></div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="w-1/2">
            <div className="h-3 bg-gray-100 rounded w-1/2 mb-1"></div>
            <div className="h-5 bg-gray-100 rounded w-3/4"></div>
          </div>
          <div className="w-1/3">
            <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
            <div className="h-3 bg-gray-100 rounded w-3/4"></div>
          </div>
        </div>
        <div className="w-full h-8 bg-gray-100 rounded-lg"></div>
      </div>
    </div>
  );

  // Header Skeleton component
  const HeaderSkeleton = () => (
    <div className="text-center mb-8 animate-pulse">
      <div className="h-7 bg-gray-100 rounded w-56 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-100 rounded w-64 mx-auto"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Most Viewed Vehicles</h1>
          <p className="text-sm text-gray-500 mt-2">Check out the top trending rides!</p>
        </div>
      )}

      {/* Vehicle Listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mx-auto max-w-lg">
          <p className="font-bold">Unable to load vehicles</p>
          <p>{error}</p>
        </div>
      ) : vehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-md mx-auto max-w-md">
          <div className="text-gray-400 mb-3">
            <Car size={36} className="mx-auto" />
          </div>
          <p className="text-lg font-semibold text-gray-800">No vehicles available</p>
          <p className="mt-2 text-sm text-gray-500">Check back later for trending vehicles.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {vehicles.map((vehicle) => (
            <Link key={vehicle._id} href={`/vehicle-detail/${vehicle._id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg relative h-full"
                onMouseEnter={() => setIsHovering(vehicle._id)}
                onMouseLeave={() => setIsHovering(null)}
              >
                {/* New Listing Badge */}
                {isNewListing(vehicle.createdAt) && (
                  <div className="absolute top-1 left-2 z-10">
                    <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                      New
                    </span>
                  </div>
                )}

                {/* Save Button */}
                <button
                  onClick={(e) => handleBookmark(vehicle._id, e)}
                  className="absolute top-1 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white"
                >
                  <Heart
                    size={16}
                    className={`${savedVehicles.includes(vehicle._id) ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                  />
                </button>

                {/* Image Section */}
                <div className="h-40 overflow-hidden">
                  <img
                    src={getMainImage(vehicle)}
                    alt={vehicle.model}
                    className={`w-full object-scale-down transition-transform duration-300 ease-in-out ${
                      isHovering === vehicle._id ? "scale-110" : "scale-100"
                    }`}
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />
                </div>

                {/* Content Section */}
                <div className="p-3">
                  {/* Vehicle Title & Condition */}
                  <div className="mb-2">
                    <h2 className="text-base font-bold text-gray-800 leading-tight">
                      {vehicle.year} {vehicle.model}
                    </h2>
                    <div className="mt-1 flex items-center">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded-md text-xs font-medium ${
                          vehicle.vehicle_condition === "brand-new"
                            ? "bg-green-100 text-green-800"
                            : vehicle.vehicle_condition === "unregister"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {vehicle.vehicle_condition === "brand-new"
                          ? "Brand New"
                          : vehicle.vehicle_condition === "unregister"
                          ? "Unregistered"
                          : "Used"}
                      </span>
                    </div>
                  </div>

                  {/* Specs */}
                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 mb-3">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar size={12} className="mr-1 text-blue-500" />
                      <span>{vehicle.year}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Gauge size={12} className="mr-1 text-blue-500" />
                      <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A"}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Fuel size={12} className="mr-1 text-blue-500" />
                      <span>{vehicle.fuelType || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3 w-3 mr-1 text-blue-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h8m-8 5h8m-8 5h8"
                        />
                      </svg>
                      <span>{vehicle.transmission || "N/A"}</span>
                    </div>
                  </div>

                  {/* Price & Seller */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="text-xs text-gray-500">Price</span>
                      <div className="text-lg font-bold text-blue-600">${formatPrice(vehicle.price)}</div>
                    </div>
                    {vehicle.user && (
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">by</span>
                        <div className="text-xs font-medium">{vehicle.user.name}</div>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-1.5 font-medium text-xs transition-all hover:shadow-sm hover:from-blue-700 hover:to-blue-800">
                    <span>View Details</span>
                    <ArrowRight size={12} className="ml-1.5" />
                  </div>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default MostViewedVehicles;