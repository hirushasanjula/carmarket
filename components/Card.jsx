"use client";

import React, { useState, useEffect } from "react";
import { Car, Truck, Compass, Calendar, Fuel, Gauge, ArrowRight, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


const VehicleSelectionBar = () => {
  const [vehicles, setVehicles] = useState([]);
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("car");
  const [isHovering, setIsHovering] = useState(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  const vehicleCategories = [
    { id: "car", name: "Cars", icon: <Car size={16} /> },
    { id: "van", name: "Vans", icon: <Truck size={16} /> },
    { id: "jeep/suv", name: "SUVs", icon: <Compass size={16} /> },
    { id: "double-cab", name: "Double Cabs", icon: <Truck size={16} /> },
  ];

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetchVehicles();
    if (status === "authenticated") {
      fetchSavedVehicles();
    }
  }, [status]);

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/vehicles?showAll=true", {
        credentials: "include", // Optional now, but safe to include
      });
      if (!response.ok) throw new Error(`Failed to fetch vehicles: ${response.status}`);
      const data = await response.json();
      console.log("Fetched vehicles:", data);
      setVehicles(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
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

  const filteredVehicles = vehicles.filter((vehicle) => vehicle.vehicle_type === selectedCategory);
  const displayedVehicles = isDesktop ? filteredVehicles.slice(0, 5) : filteredVehicles;

  console.log(
    `Selected Category: ${selectedCategory}, Total Vehicles: ${vehicles.length}, Filtered Vehicles: ${filteredVehicles.length}, Displayed: ${displayedVehicles.length}, Is Desktop: ${isDesktop}`
  );

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";
  const isNewListing = (createdAt) => {
    if (!createdAt) return false;
    const differenceInDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return differenceInDays < 7;
  };

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

  const CategorySkeleton = () => (
    <div className="w-full max-w-xl mx-auto mb-8 animate-pulse">
      <div className="h-7 bg-gray-100 rounded w-56 mx-auto mb-4"></div>
      <div className="bg-white rounded-xl shadow-md p-1.5">
        <div className="grid grid-cols-4 gap-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 bg-gradient-to-b from-gray-50 to-white">
      {loading ? (
        <CategorySkeleton />
      ) : (
        <div className="w-full max-w-xl mx-auto mb-8">
          <h1 className="text-2xl font-bold text-center mb-4 text-gray-800">Find Your Perfect Ride</h1>
          <div className="bg-white rounded-xl shadow-md p-1.5">
            <div className="grid grid-cols-4 gap-1">
              {vehicleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-center p-2 rounded-lg transition-all duration-200 ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <div className="mr-1.5">{category.icon}</div>
                  <span className="text-xs font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {[...Array(isDesktop ? 5 : 3)].map((_, index) => (
            <VehicleCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg mx-auto max-w-lg">
          <p className="font-bold">Unable to load vehicles</p>
          <p>{error}</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-xl shadow-md mx-auto max-w-md">
          <div className="text-gray-400 mb-3">
            <Truck size={36} className="mx-auto" />
          </div>
          <p className="text-lg font-semibold text-gray-800">
            No {selectedCategory} listings available
          </p>
          <p className="mt-2 text-sm text-gray-500">Try selecting a different category or check back later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayedVehicles.map((vehicle) => (
              <Link key={vehicle._id} href={`/vehicle-detail/${vehicle._id}`} className="block">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-200 hover:shadow-lg relative h-full"
                  onMouseEnter={() => setIsHovering(vehicle._id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  {isNewListing(vehicle.createdAt) && (
                    <div className="absolute top-1 left-2 z-10">
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        New
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleBookmark(vehicle._id, e)}
                    className="absolute top-1 right-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm transition-all hover:bg-white"
                  >
                    <Heart
                      size={16}
                      className={`${savedVehicles.includes(vehicle._id) ? "fill-red-500 text-red-500" : "text-gray-500"}`}
                    />
                  </button>
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
                  <div className="p-3">
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
                    <div className="w-full flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg py-1.5 font-medium text-xs transition-all hover:shadow-sm hover:from-blue-700 hover:to-blue-800">
                      <span>View Details</span>
                      <ArrowRight size={12} className="ml-1.5" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {filteredVehicles.length > displayedVehicles.length && (
            <div className="mt-6 text-center">
              <Link href={`/vehicles/${selectedCategory}`}>
                <button className="bg-blue-600 text-white font-medium text-sm px-6 py-2 rounded-lg hover:bg-blue-700 transition-all">
                  View All{" "}
                  {selectedCategory === "car"
                    ? "Cars"
                    : selectedCategory === "van"
                    ? "Vans"
                    : selectedCategory === "jeep/suv"
                    ? "SUVs"
                    : "Double Cabs"}
                </button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default VehicleSelectionBar;