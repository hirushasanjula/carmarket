"use client";

import { useState, useEffect } from "react";
import VehicleSelectionBar from "@/components/Card";
import Footer from "@/components/Footer";
import HeroImage from "@/components/HeroImage";
import MostViewCardList from "@/components/MostViewd";
import FilterBar from "@/components/FilterBar";


export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">


      {/* Main Content with Sidebar */}
      <main className="flex-1 flex container mx-auto px-4 py-8">
        {/* Sidebar: FilterBar */}
        <aside className="w-1/4 pr-6 mt-10">
          <FilterBar />
        </aside>

        {/* Main Content */}
        <div className="w-3/4">
          <HeroImage />
          <VehicleSelectionBar />
          <MostViewCardList />
        </div>
      </main>

      <Footer />
    </div>
  );
}