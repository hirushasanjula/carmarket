"use client";

import React, { useState, useEffect } from "react";
import { PencilIcon, StarIcon, EyeIcon, BookmarkIcon, TrashIcon } from "lucide-react";
import EditVehicleModal from "@/components/Edit Box";
import DeleteButton from "@/components/DeleteButton";
import VehicleSkeleton from "@/components/VehicleSkeleton";
import { useSession } from "next-auth/react";

const VehicleListings = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      fetchVehicles();
    } else if (status === "unauthenticated") {
      setError("You must be logged in to view your listings");
      setLoading(false);
    }
  }, [status]);

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Fetched vehicles for user:", JSON.stringify(data, null, 2));
      setVehicles(Array.isArray(data) ? data : (data.vehicles || []));
      setLoading(false);
    } catch (error) {
      console.error("Error fetching vehicles:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSaveEdit = async (updatedVehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${updatedVehicle._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedVehicle),
      });

      if (!response.ok) {
        throw new Error(`Failed to update vehicle: ${response.status}`);
      }

      setVehicles((prevVehicles) =>
        prevVehicles.map((v) => (v._id === updatedVehicle._id ? updatedVehicle : v))
      );
      
      setSelectedVehicle(null);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to update vehicle. Please try again.");
    }
  };

  const handleDeleteVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error(`Failed to delete vehicle: ${response.status}`);
      }

      setVehicles((prevVehicles) => prevVehicles.filter((v) => v._id !== vehicleId));
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      throw error;
    }
  };

  const getVehicleTitle = (vehicle) => {
    return `${vehicle.year} ${vehicle.model}`;
  };

  const getMainImage = (vehicle) => {
    return vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";
  };

  const getVehicleStatus = (vehicle) => {
    return vehicle.status || "Active";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString() : "0";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  // Render skeletons during initial loading
  const renderSkeletons = () => {
    return Array(6).fill(0).map((_, index) => (
      <VehicleSkeleton key={`skeleton-${index}`} />
    ));
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4 ">
        <div className="flex justify-center items-center mb-7">
          <div className="shadow-md w-fit border border-black rounded-lg p-6 mb-8">
            <div className="h-7 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-gray-300 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Authentication Required</p>
          <p>You need to log in to view your vehicle listings</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center mb-7">
          <div className="shadow-md w-fit border border-black rounded-lg p-6 mb-8">
            <div className="h-7 bg-gray-300 rounded w-64 animate-pulse"></div>
            <div className="h-5 bg-gray-300 rounded w-48 mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error loading vehicles</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center mt-16 p-2 items-center mb-7 cursor-pointer">
        <div className="shadow-md w-fit border border-black rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-black">My Vehicle Listings</h1>
          <p className="text-gray-500 mt-1">
            Total Active Listings: {vehicles.filter((v) => getVehicleStatus(v) === "Active").length}
          </p>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No vehicles found</p>
          <p className="mt-2 text-gray-500">Try adding some vehicle listings first.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {vehicles.map((vehicle) => (
            <div key={vehicle._id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img 
                  src={getMainImage(vehicle)} 
                  alt={vehicle.model} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                    e.target.onerror = null;
                  }}
                />
                <span className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vehicle.status)}`}>
                  {vehicle.status}
                </span>
                <span className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {vehicle.vehicle_condition || "Unknown"}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{getVehicleTitle(vehicle)}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">${formatPrice(vehicle.price)}</p>
                
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-500 mb-3">
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Type:</span> {vehicle.vehicle_type || "N/A"}
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Fuel:</span> {vehicle.fuelType || "N/A"}
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Trans:</span> {vehicle.transmission || "N/A"}
                  </span>
                  <span className="flex items-center">
                    <span className="font-medium mr-1">Mileage:</span> {vehicle.mileage ? `${vehicle.mileage} km` : "N/A"}
                  </span>
                </div>
                
                {vehicle.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{vehicle.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>Posted {formatDate(vehicle.createdAt)}</span>
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                      <EyeIcon className="w-4 h-4 mr-1" />
                      {vehicle.viewers ? vehicle.viewers.length : 0}
                    </span>
                    <span className="flex items-center">
                      <BookmarkIcon className="w-4 h-4 mr-1" />
                      {vehicle.saves || 0}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between border-t pt-4">
                  <button 
                    onClick={() => handleEditClick(vehicle)} 
                    className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    <span>Edit</span>
                  </button>
                  <button className="inline-flex items-center text-yellow-600 hover:text-yellow-800 transition-colors">
                    <StarIcon className="w-4 h-4 mr-1" />
                    <span>Feature</span>
                  </button>
                  
                  <DeleteButton 
                    onDelete={handleDeleteVehicle} 
                    itemId={vehicle._id} 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedVehicle && (
        <EditVehicleModal 
          vehicle={selectedVehicle} 
          onClose={() => setSelectedVehicle(null)} 
          onSave={handleSaveEdit} 
        />
      )}
    </div>
  );
};

export default VehicleListings;