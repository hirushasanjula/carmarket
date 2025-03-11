"use client";

import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Share2, Flag, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RecommendedVehicles from "@/components/RecommendedVehicles";

export default function VehicleDetailPage() {
  const [vehicle, setVehicle] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id;
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          credentials: "include", // Optional, safe to include
        });
        if (!response.ok) {
          if (response.status === 404) throw new Error("Vehicle not found");
          throw new Error(`Failed to fetch vehicle: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setVehicle(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicleDetails();
      // Record view only if authenticated
      if (status === "authenticated") {
        fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId, action: "view" }),
          credentials: "include",
        }).catch((err) => console.error("Error recording view:", err));
      }
    }
  }, [vehicleId, status]);

  const handleLike = async () => {
    if (status !== "authenticated") {
      alert("Please log in to like this vehicle");
      return;
    }

    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, action: "like" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record like");
      const data = await res.json();
      console.log("Like recorded:", data);
    } catch (error) {
      console.error("Error liking vehicle:", error);
    }
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getImageOrPlaceholder = (index) => {
    if (!vehicle || !vehicle.images || vehicle.images.length === 0) return "/api/placeholder/800/500";
    if (index >= vehicle.images.length) return vehicle.images[0];
    return vehicle.images[index];
  };
  const handleBackClick = (e) => {
    e.preventDefault();
    router.back();
  };
  const getVehicleSpecs = () => {
    if (!vehicle) return {};
    return {
      condition: vehicle.vehicle_condition === "brand-new" ? "Brand New" : 
                 vehicle.vehicle_condition === "unregister" ? "Unregistered" : "Used",
      year: vehicle.year,
      mileage: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A",
      transmission: vehicle.transmission || "N/A",
      fuelType: vehicle.fuelType || "N/A",
      type: vehicle.vehicle_type ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1) : "N/A",
    };
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><p>Loading vehicle details...</p></div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} className="mr-2" /> Back to listings
        </button>
      </div>
    </div>
  );
  if (!vehicle) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <p>Vehicle not found</p>
      <button onClick={handleBackClick} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} className="mr-2" /> Back to listings
      </button>
    </div>
  );

  const vehicleSpecs = getVehicleSpecs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={handleBackClick} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} className="mr-2" /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={getImageOrPlaceholder(activeImage)}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/api/placeholder/800/500"; e.target.onerror = null; }}
                />
              </div>
              <div className="p-4 grid grid-cols-4 gap-2">
                {vehicle.images && vehicle.images.length > 0 ? (
                  vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${activeImage === index ? "border-blue-600" : "border-transparent"}`}
                    >
                      <img
                        src={image}
                        alt={`${vehicle.model} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/api/placeholder/800/500"; e.target.onerror = null; }}
                      />
                    </button>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-4 text-gray-500">No additional images available</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(vehicleSpecs).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key}</dt>
                    <dd className="text-base font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 mb-6">{vehicle.description || "No description provided"}</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.year} {vehicle.model}</h1>
                <p className="text-3xl font-bold text-blue-600 mt-2">Rs. {formatPrice(vehicle.price)}</p>
              </div>
              {vehicle.location && vehicle.location.coordinates && (
                <div className="flex items-center text-gray-600 mb-6">
                  <MapPin size={20} className="mr-2" /> Location available
                </div>
              )}
              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <Phone size={20} /> <span>{vehicle.user?.mobile || "Contact seller"}</span>
                </button>
                {vehicle.user && vehicle.user.email && (
                  <button className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                    <Mail size={20} /> <span>Email Seller</span>
                  </button>
                )}
                <button
                  onClick={handleLike}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Like Vehicle</span>
                </button>
              </div>
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <Share2 size={20} className="mr-2" /> Share
                </button>
                <button className="flex items-center text-gray-600 hover:text-red-600">
                  <Flag size={20} className="mr-2" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        <RecommendedVehicles currentVehicleId={vehicleId} />
      </div>
    </div>
  );
}