"use client";

import { useState, useEffect } from "react";
import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImage from "@/components/HeroImage";
import MostViewCardList from "@/components/MostViewd";
import FilterBar from "@/components/FilterBar";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    
    // Set initial states
    handleResize();
    
    // Add event listeners
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
            <HeroImage />
            <VehicleSelectionBar />
            <MostViewCardList />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}