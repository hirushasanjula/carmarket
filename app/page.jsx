"use client";

import { useState, useEffect } from "react";
import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImage from "@/components/HeroImage";
import MostViewCardList from "@/components/MostViewd";
import FilterBar from "@/components/FilterBar";
import VehicleMap from "@/components/VehicleMap";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    // Set initial states
    handleResize();

    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    // Fetch user's location and all active vehicles
    const fetchData = async () => {
      try {
        setLoadingMap(true);

        // Get user's location
        const position = await getUserLocation();
        setUserLocation(position);

        // Fetch all active vehicles
        const response = await fetch("/api/vehicles?status=Active");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch vehicles.");
        }

        setVehicles(data || []);
      } catch (err) {
        console.error("Map data error:", err);
        setMapError("Couldn’t load vehicles. Please allow location access.");
      } finally {
        setLoadingMap(false);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const getUserLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
      }
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        (err) => reject(err)
      );
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content with Sidebar */}
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Only show filter bar at top on mobile */}
        <div className="md:hidden w-full">
          <FilterBar />
        </div>

        {/* Responsive layout container */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: FilterBar - Hidden on mobile */}
          <aside className="hidden md:block md:w-1/4 md:pr-6 md:mt-12">
            <FilterBar />
          </aside>

          {/* Main Content - Full width on mobile */}
          <div className="w-full md:w-3/4 mt-4">
            {/* Hero Image and Map Row */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-2/3">
                <HeroImage />
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-xl font-bold text-gray-800 mb-2">Available Vehicles</h2>
                {loadingMap && (
                  <p className="text-gray-600">Loading map...</p>
                )}
                {mapError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {mapError}
                  </div>
                )}
                {userLocation && vehicles.length > 0 && (
                  <VehicleMap
                    latitude={userLocation.latitude}
                    longitude={userLocation.longitude}
                    vehicles={vehicles}
                  />
                )}
                {!loadingMap && !mapError && vehicles.length === 0 && (
                  <p className="text-gray-600">No active vehicles available.</p>
                )}
              </div>
            </div>

            <VehicleSelectionBar />
            <MostViewCardList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}