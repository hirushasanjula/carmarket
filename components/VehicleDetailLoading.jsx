"use client";

import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { GiCarWheel } from "react-icons/gi";
import { useRouter } from "next/navigation";

export default function VehicleDetailLoading() {
  const [progress, setProgress] = useState(0);
  const router = useRouter();

  const handleBackClick = (e) => {
    e.preventDefault();
    router.back();
  };

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 90) {
          return prevProgress + 0.2;
        }
        return prevProgress + (100 - prevProgress) / 10;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="max-w-7xl mx-auto px-4 py-8 w-full">
        <button 
          onClick={handleBackClick} 
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft size={20} className="mr-2" /> Back to listings
        </button>
      </div>

      {/* Center content with flex */}
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 flex flex-col items-center justify-center text-center">
          {/* Vehicle wheel loading spinner using GiCarWheel */}
          <div className="animate-spin mb-6">
            <GiCarWheel size={96} className="text-gray-700" />
          </div>
          
          {/* Loading text */}
          <p className="text-gray-600 font-medium text-lg mb-2">Loading vehicle details...</p>
        
        </div>
      </div>
    </div>
  );
}