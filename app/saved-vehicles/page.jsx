'use client';

import React, { useState, useEffect } from 'react';
import { ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';
import { CiBookmark } from "react-icons/ci";

const SavedVehiclesPage = () => {
  const [savedVehicles, setSavedVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchSavedVehicles();
  }, []);

  const fetchSavedVehicles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/saved-vehicles');
      if (!response.ok) {
        throw new Error('Failed to fetch saved vehicles');
      }
      const data = await response.json();
      setSavedVehicles(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleRemoveSaved = async (vehicleId) => {
    try {
      const response = await fetch('/api/saved-vehicles', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId })
      });
      if (!response.ok) {
        throw new Error('Failed to remove saved vehicle');
      }
      setSavedVehicles(savedVehicles.filter(sv => sv.vehicle._id !== vehicleId));
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPrice = (price) => price ? price.toLocaleString() : "0";
  const getMainImage = (vehicle) => vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Saved Vehicles</h1>
      {savedVehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No saved vehicles</p>
          <Link href="/" className="text-blue-600 hover:underline">Browse vehicles</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {savedVehicles.map((savedVehicle) => {
            const vehicle = savedVehicle.vehicle;
            return (
              <div key={vehicle._id} className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg">
                <div className="h-40 flex items-center justify-center bg-gray-50">
                  <img 
                    src={getMainImage(vehicle)} 
                    alt={vehicle.model} 
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = "/api/placeholder/400/300"; }}
                  />
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800">{vehicle.year} {vehicle.model}</h2>
                    <div className="flex items-center space-x-2 text-xs text-gray-600">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                        {vehicle.vehicle_condition === 'brand-new' ? 'Brand New' : 
                         vehicle.vehicle_condition === 'unregister' ? 'Unregistered' : 'Used'}
                      </span>
                      {vehicle.user && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          Seller: {vehicle.user.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)}</span>
                      <span>{vehicle.transmission || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{vehicle.fuelType || 'N/A'}</span>
                      <span>{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</span>
                    </div>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Price</span>
                    <span className="text-base font-semibold text-gray-900">${formatPrice(vehicle.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <Link href={`/vehicle-detail/${vehicle._id}`} className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg py-2 space-x-2 hover:bg-blue-700">
                      <span>View Now</span>
                      <ArrowRight size={20} />
                    </Link>
                    <button 
                      onClick={() => handleRemoveSaved(vehicle._id)}
                      className="p-2 text-gray-600 hover:text-red-600"
                    >
                      <CiBookmark size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SavedVehiclesPage;