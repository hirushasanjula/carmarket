"use client";

import React, { useState, useEffect } from "react";
import { Car, Truck, Compass, Calendar, Fuel, Gauge, ArrowRight, Heart, MapPin } from "lucide-react";
import { CiBookmark } from "react-icons/ci";
import { PiVanLight } from "react-icons/pi";
import { TbCarSuv } from "react-icons/tb";
import { FaTruckPickup } from "react-icons/fa6";
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
    { id: "van", name: "Vans", icon: <PiVanLight size={17} /> },
    { id: "jeep/suv", name: "SUVs", icon: <TbCarSuv size={16} /> },
    { id: "double-cab", name: "Double Cabs", icon: <FaTruckPickup size={16} /> },
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
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to fetch vehicles: ${response.status}`);
      const data = await response.json();
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
      if (!response.ok) return;
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
      router.push("/api/auth/signin");
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
  const displayedVehicles = isDesktop ? filteredVehicles.slice(0, 5) : filteredVehicles.slice(0, 6);

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";
  const isNewListing = (createdAt) => {
    if (!createdAt) return false;
    const differenceInDays = Math.floor((new Date() - new Date(createdAt)) / (1000 * 60 * 60 * 24));
    return differenceInDays < 7;
  };

  const VehicleCardSkeleton = () => (
    <div className="bg-white rounded-2xl shadow-md overflow-hidden shrink-0 w-64 h-full animate-pulse">
      <div className="h-40 bg-gray-100"></div>
      <div className="p-4">
        <div className="mb-3">
          <div className="h-5 bg-gray-100 rounded-full w-3/4 mb-1"></div>
          <div className="h-4 bg-gray-100 rounded-full w-1/3"></div>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-3">
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
          <div className="h-3 bg-gray-100 rounded-full"></div>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div className="w-1/2">
            <div className="h-3 bg-gray-100 rounded-full w-1/2 mb-1"></div>
            <div className="h-5 bg-gray-100 rounded-full w-3/4"></div>
          </div>
          <div className="w-1/3">
            <div className="h-3 bg-gray-100 rounded-full w-full mb-1"></div>
            <div className="h-3 bg-gray-100 rounded-full w-3/4"></div>
          </div>
        </div>
        <div className="w-full h-8 bg-gray-100 rounded-full"></div>
      </div>
    </div>
  );

  const CategorySkeleton = () => (
    <div className="w-full max-w-xl mx-auto mb-8 animate-pulse">
      <div className="h-7 bg-gray-100 rounded-full w-56 mx-auto mb-4"></div>
      <div className="bg-white rounded-2xl shadow-md p-2">
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded-full"></div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12">
      {loading ? (
        <CategorySkeleton />
      ) : (
        <div className="w-full max-w-xl mx-auto mb-10">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              Find Your Perfect Ride
            </span>
          </h1>
          <div className="bg-white rounded-2xl shadow-lg p-2 backdrop-blur-sm bg-white/80">
            <div className="grid grid-cols-4 gap-2">
              {vehicleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center justify-center p-3 rounded-xl transition-all duration-300 ${
                    selectedCategory === category.id
                      ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-200"
                      : "bg-gray-50 text-gray-700 hover:bg-gray-100 hover:scale-105"
                  }`}
                >
                  <div className="mr-2">{category.icon}</div>
                  <span className="text-xs font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex overflow-x-auto pb-6  lg:cols-4  lg:gap-6 space-x-6 lg:space-x-0">
          {[...Array(isDesktop ? 5 : 3)].map((_, index) => (
            <div key={index} className="mr-4 lg:mr-0">
              <VehicleCardSkeleton />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-xl mx-auto max-w-lg">
          <p className="font-bold">Unable to load vehicles</p>
          <p>{error}</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-2xl shadow-lg mx-auto max-w-md bg-opacity-80 backdrop-blur-sm">
          <div className="text-gray-400 mb-4">
            <Truck size={48} className="mx-auto" />
          </div>
          <p className="text-xl font-semibold text-gray-800">
            No {selectedCategory} listings available
          </p>
          <p className="mt-3 text-sm text-gray-500">Try selecting a different category or check back later.</p>
        </div>
      ) : (
        <>
          <div className="flex overflow-x-auto pb-6  lg:cols-4  lg:gap-6 space-x-6 lg:space-x-0">
            {displayedVehicles.map((vehicle, idx) => (
              <Link key={vehicle._id} href={`/vehicle-detail/${vehicle._id}`} className="block shrink-0 w-64 lg:w-auto">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl relative h-full group hover:translate-y-1"
                  onMouseEnter={() => setIsHovering(vehicle._id)}
                  onMouseLeave={() => setIsHovering(null)}
                >
                  {isNewListing(vehicle.createdAt) && (
                    <div className="absolute top-3 left-3 z-10">
                      <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                        New
                      </span>
                    </div>
                  )}
                  <button
                    onClick={(e) => handleBookmark(vehicle._id, e)}
                    className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md transition-all hover:bg-white hover:scale-110"
                  >
                    <CiBookmark
                      size={16}
                      className={`${
                        savedVehicles.includes(vehicle._id) ? "fill-red-500 text-red-500" : "text-gray-500"
                      } transition-all duration-300`}
                    />
                  </button>
                  <div className="h-48 overflow-hidden relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent z-0"></div>
                    <img
                      src={getMainImage(vehicle)}
                      alt={vehicle.model}
                      className={`w-full h-full object-cover transition-transform duration-500 ease-out ${
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
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${
                            vehicle.vehicle_condition === "brand-new"
                              ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                              : vehicle.vehicle_condition === "unregister"
                              ? "bg-gradient-to-r from-amber-100 to-amber-200 text-amber-800"
                              : "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
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
                    <div className="grid grid-cols-2 gap-y-2 gap-x-3 mb-4 text-xs text-gray-600">
                      <div className="flex items-center">
                        <Calendar size={14} className="mr-2 text-indigo-500" />
                        <span>{vehicle.year}</span>
                      </div>
                      <div className="flex items-center">
                        <Gauge size={14} className="mr-2 text-indigo-500" />
                        <span>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <Fuel size={14} className="mr-2 text-indigo-500" />
                        <span>{vehicle.fuelType || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 text-indigo-500"
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
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-indigo-500" />
                        <span>{vehicle.location?.region || "N/A"}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin size={14} className="mr-2 text-indigo-500" />
                        <span>{vehicle.location?.city || "N/A"}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-xs text-gray-500">Price</span>
                        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                          Rs. {formatPrice(vehicle.price)}
                        </div>
                      </div>
                      {vehicle.user && (
                        <div className="text-right">
                          <span className="text-xs text-gray-500 block">by</span>
                          <div className="text-xs font-medium">{vehicle.user.name}</div>
                        </div>
                      )}
                    </div>
                    <div className="w-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl py-2.5 font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-200 group-hover:from-blue-600 group-hover:to-indigo-700">
                      <span>View Details</span>
                      <ArrowRight size={14} className="ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>

          {filteredVehicles.length > displayedVehicles.length && (
            <div className="mt-10 text-center">
              <Link href={`/vehicles/${selectedCategory}`}>
                <button className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium text-sm px-8 py-3 rounded-xl hover:shadow-lg hover:shadow-blue-200 transition-all duration-300 hover:translate-y-1">
                  View All{" "}
                  {selectedCategory === "car"
                    ? "Cars"
                    : selectedCategory === "van"
                    ? "Vans"
                    : selectedCategory === "jeep/suv"
                    ? "SUVs"
                    : "Double Cabs"}
                  <ArrowRight size={14} className="ml-2 inline-block" />
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