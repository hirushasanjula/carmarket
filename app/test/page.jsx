"use client";

import React, { useState } from "react";
import { PencilIcon, TrashIcon, StarIcon, EyeIcon, BookmarkIcon } from "lucide-react";
import EditVehicleModal from "@/components/Edit Box";

const VehicleListings = () => {
  const [vehicles, setVehicles] = useState([
    {
      id: "1",
      image: "/car.jpeg",
      title: "2023 Tesla Model 3",
      price: 45000,
      status: "Active",
      postedDate: "2024-02-15",
      views: 234,
      saves: 45,
    },
    {
      id: "2",
      image: "/api/placeholder/400/300",
      title: "2022 BMW X5",
      price: 55000,
      status: "Pending",
      postedDate: "2024-02-10",
      views: 456,
      saves: 89,
    },
    {
      id: "3",
      image: "/api/placeholder/400/300",
      title: "2021 Mercedes-Benz C-Class",
      price: 38000,
      status: "Sold",
      postedDate: "2024-02-05",
      views: 789,
      saves: 123,
    },
  ]);

  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const handleEditClick = (vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleSaveEdit = (updatedVehicle) => {
    setVehicles((prevVehicles) =>
      prevVehicles.map((v) => (v.id === updatedVehicle.id ? { ...v, ...updatedVehicle } : v))
    );
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-center items-center mb-7 cursor-pointer">
        <div className="shadow-md w-fit border border-black rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-black">Vehicle Listings</h1>
          <p className="text-gray-500 mt-1">
            Total Active Listings: {vehicles.filter((v) => v.status === "Active").length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {vehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-lg shadow-lg border-gray-800 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative">
              <img src={vehicle.image} alt={vehicle.title} className="w-full h-48 object-scale-down" />
              <span className="absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                {vehicle.status}
              </span>
            </div>

            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{vehicle.title}</h3>
              <p className="text-2xl font-bold text-blue-600 mb-4">${vehicle.price.toLocaleString()}</p>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>Posted {new Date(vehicle.postedDate).toLocaleDateString()}</span>
                <div className="flex items-center space-x-4">
                  <span className="flex items-center">
                    <EyeIcon className="w-4 h-4 mr-1" />
                    {vehicle.views}
                  </span>
                  <span className="flex items-center">
                    <BookmarkIcon className="w-4 h-4 mr-1" />
                    {vehicle.saves}
                  </span>
                </div>
              </div>

              <div className="flex justify-between border-t pt-4">
                <button onClick={() => handleEditClick(vehicle)} className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors">
                  <PencilIcon className="w-4 h-4 mr-1" />
                  <span>Edit</span>
                </button>
                <button className="inline-flex items-center text-yellow-600 hover:text-yellow-800 transition-colors">
                  <StarIcon className="w-4 h-4 mr-1" />
                  <span>Feature</span>
                </button>
                <button className="inline-flex items-center text-red-600 hover:text-red-800 transition-colors">
                  <TrashIcon className="w-4 h-4 mr-1" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedVehicle && (
        <EditVehicleModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} onSave={handleSaveEdit} />
      )}
    </div>
  );
};

export default VehicleListings;
