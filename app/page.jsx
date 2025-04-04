"use client";

import { useState, useEffect } from "react";
import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImageSlider from "@/components/HeroImage";// Use your slider
import MostViewCardList from "@/components/MostViewd";
import FilterBar from "@/components/FilterBar";
import dynamic from "next/dynamic";
import SearchBar from "@/components/Search";

// Load VehicleMap dynamically, disabling SSR
const VehicleMap = dynamic(() => import("@/components/VehicleMap"), { ssr: false });

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loadingMap, setLoadingMap] = useState(false);
  const [mapError, setMapError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    const fetchVehicles = async () => {
      try {
        setLoadingMap(true);
        const url = searchQuery
          ? `/api/vehicles?status=Active&search=${encodeURIComponent(searchQuery)}`
          : "/api/vehicles?status=Active";
        console.log("Fetching vehicles with URL:", url);
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          console.error("Fetch failed:", data);
          throw new Error(data.error || "Failed to fetch vehicles.");
        }

        console.log("Fetched vehicles data:", data);
        setVehicles(data || []);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setMapError("Couldn’t load vehicles: " + err.message);
      } finally {
        setLoadingMap(false);
      }
    };

    fetchVehicles();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [searchQuery]);

  console.log("Home rendering - searchQuery:", searchQuery, "vehicles:", vehicles);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="md:hidden w-full">
          <FilterBar />
        </div>

        <div className="flex flex-col md:flex-row">
          <aside className="hidden md:block md:w-1/4 md:pr-6 md:mt-12">
            <FilterBar />
          </aside>

          <div className="w-full md:w-3/4 mt-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-2/3">
                <HeroImageSlider>
                  <SearchBar scrolled={scrolled} setSearchQuery={setSearchQuery} />
                </HeroImageSlider>
              </div>
              <div className="w-full md:w-1/3">
                <h2 className="text-xl font-bold text-gray-800 mb-2">
                  {searchQuery ? `Matching "${searchQuery}"` : "Available Vehicles"}
                </h2>
                {loadingMap && <p className="text-gray-600">Loading map...</p>}
                {mapError && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                    {mapError}
                  </div>
                )}
                {vehicles.length > 0 ? (
                  <VehicleMap vehicles={vehicles} />
                ) : (
                  !loadingMap && !mapError && (
                    <p className="text-gray-600">No active vehicles found.</p>
                  )
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