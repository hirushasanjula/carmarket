"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Fuel, Gauge, ArrowRight, Heart, Car } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const MostViewedVehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isHovering, setIsHovering] = useState(null);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchMostViewedVehicles(); // Fetch public vehicles always
    if (status === "authenticated") {
      fetchSavedVehicles(); // Fetch saved vehicles only if logged in
    }
  }, [status]);

  const fetchMostViewedVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vehicles?showAll=true", {
        credentials: "include", // Optional, but safe to include
      });
      if (!response.ok) throw new Error(`Failed to fetch vehicles: ${response.status}`);
      const data = await response.json();

      // Sort by views and take top 4
      const topViewedVehicles = Array.isArray(data)
        ? data
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 4)
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
      const response = await fetch("/api/saved-vehicles", {
        credentials: "include",
      });
      if (!response.ok) {
        console.log("Saved vehicles fetch failed (likely not logged in):", response.status);
        return;
      }
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
    if (status !== "authenticated") {
      router.push("/api/auth/signin"); // Redirect to login page
      return;
    }
    try {
      const isSaved = savedVehicles.includes(vehicleId);
      const method = isSaved ? "DELETE" : "POST";
      const response = await fetch("/api/saved-vehicles", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId }),
        credentials: "include",
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

  const VehicleCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full animate-pulse">
      <div className="h-44 bg-gray-100"></div>
      <div className="p-4">
        <div className="mb-3">
          <div className="h-5 bg-gray-100 rounded-full w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded-full w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4">
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center mb-4">
          <div className="w-1/2">
            <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-1"></div>
            <div className="h-6 bg-gray-100 rounded-full w-3/4"></div>
          </div>
          <div className="w-1/3">
            <div className="h-3 bg-gray-100 rounded-full w-full mb-1"></div>
            <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
          </div>
        </div>
        <div className="w-full h-10 bg-gray-100 rounded-xl"></div>
      </div>
    </div>
  );

  const HeaderSkeleton = () => (
    <div className="text-center mb-10 animate-pulse">
      <div className="h-8 bg-gray-100 rounded-full w-64 mx-auto mb-3"></div>
      <div className="h-4 bg-gray-100 rounded-full w-72 mx-auto"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-6 py-12 bg-gradient-to-br from-blue-50 via-white to-gray-50">
      {loading ? (
        <HeaderSkeleton />
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
            Most Viewed Vehicles
          </h1>
          <p className="text-sm text-gray-500 mt-3 max-w-lg mx-auto">
            Check out the top trending rides our users are exploring right now!
          </p>
        </motion.div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-xl mx-auto max-w-lg"
        >
          <p className="font-bold">Unable to load vehicles</p>
          <p>{error}</p>
        </motion.div>
      ) : vehicles.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-10 bg-white rounded-2xl shadow-xl mx-auto max-w-md"
        >
          <div className="text-gray-400 mb-4">
            <Car size={48} className="mx-auto" />
          </div>
          <p className="text-xl font-semibold text-gray-800">No vehicles available</p>
          <p className="mt-3 text-sm text-gray-500">Check back later for trending vehicles.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {vehicles.map((vehicle, index) => (
            <Link key={vehicle._id} href={`/vehicle-detail/${vehicle._id}`} className="block">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl relative h-full group"
                onMouseEnter={() => setIsHovering(vehicle._id)}
                onMouseLeave={() => setIsHovering(null)}
              >
                {isNewListing(vehicle.createdAt) && (
                  <div className="absolute top-3 left-3 z-10">
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                      New
                    </span>
                  </div>
                )}
                <button
                  onClick={(e) => handleBookmark(vehicle._id, e)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white hover:scale-110"
                >
                  <Heart
                    size={18}
                    className={`transition-colors ${
                      savedVehicles.includes(vehicle._id) 
                        ? "fill-red-500 text-red-500" 
                        : "text-gray-400 group-hover:text-red-400"
                    }`}
                  />
                </button>
                <div className="h-44 overflow-hidden bg-gray-100">
                  <img
                    src={getMainImage(vehicle)}
                    alt={vehicle.model}
                    className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out ${
                      isHovering === vehicle._id ? "scale-110" : "scale-100"
                    }`}
                    onError={(e) => {
                      e.target.src = "/api/placeholder/400/300";
                    }}
                  />
                </div>
                <div className="p-4">
                  <div className="mb-3">
                    <h2 className="text-lg font-bold text-gray-800 leading-tight">
                      {vehicle.year} {vehicle.model}
                    </h2>
                    <div className="mt-2 flex items-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-lg text-xs font-medium ${
                          vehicle.vehicle_condition === "brand-new"
                            ? "bg-green-100 text-green-700"
                            : vehicle.vehicle_condition === "unregister"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-blue-100 text-blue-700"
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
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4">
                    <div className="flex items-center text-xs text-gray-600">
                      <Calendar size={14} className="mr-1.5 text-blue-500" />
                      <span>{vehicle.year}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Gauge size={14} className="mr-1.5 text-blue-500" />
                      <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A"}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <Fuel size={14} className="mr-1.5 text-blue-500" />
                      <span>{vehicle.fuelType || "N/A"}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-600">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1.5 text-blue-500"
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
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Price</span>
                      <div className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-700">
                        ${formatPrice(vehicle.price)}
                      </div>
                    </div>
                    {vehicle.user && (
                      <div className="text-right">
                        <span className="text-xs text-gray-500 block">Listed by</span>
                        <div className="text-xs font-medium text-gray-700">{vehicle.user.name}</div>
                      </div>
                    )}
                  </div>
                  <div className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl py-2.5 font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 hover:from-blue-700 hover:to-indigo-800 transform hover:-translate-y-0.5">
                    <span>View Details</span>
                    <ArrowRight size={14} className="ml-2" />
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