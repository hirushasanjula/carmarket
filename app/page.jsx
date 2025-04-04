"use client";

import { useState, useEffect } from "react";
import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImageSlider from "@/components/HeroImage";
import MostViewCardList from "@/components/MostViewd";
import FilterBar from "@/components/FilterBar";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    const fetchData = async () => {
      try {
        setLoading(true);
        const url = "/api/vehicles?status=Active";
        console.log("Fetching vehicles with URL:", url);
        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch vehicles.");
        }

        console.log("Fetched vehicles:", data);
        setVehicles(data || []);
      } catch (err) {
        console.error("Fetch error:", err.message);
        setError("Couldn’t load vehicles: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []); // No dependencies since search is removed

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* FilterBar at top on mobile */}
        <div className="md:hidden w-full">
          <FilterBar />
        </div>

        {/* Main layout */}
        <div className="flex flex-col md:flex-row">
          {/* Sidebar: FilterBar - Hidden on mobile */}
          <aside className="hidden md:block md:w-1/4 md:pr-6 md:mt-12">
            <FilterBar />
          </aside>

          {/* Main Content */}
          <div className="w-full md:w-3/4 mt-4">
            {/* Center HeroImageSlider */}
            <div className="flex justify-center">
              <HeroImageSlider />
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