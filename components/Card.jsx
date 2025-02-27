'use client';

import React, { useState, useEffect } from 'react';
import { Users, ArrowRight, Phone } from 'lucide-react';
import Link from 'next/link';

const VehicleSelectionBar = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('car');
  const vehicleCategories = ['car', 'van', 'jeep/suv', 'double-cab'];

  // Fetch vehicles when component mounts
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        // Add showAll=true to show all vehicles (not just the user's)
        const response = await fetch('/api/vehicles?showAll=true');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicles: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setVehicles(Array.isArray(data) ? data : []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Filter vehicles based on selected category
  const filteredVehicles = vehicles.filter(vehicle => vehicle.vehicle_type === selectedCategory);

  // Format price with commas
  const formatPrice = (price) => {
    return price ? price.toLocaleString() : "0";
  };

  // Get the main image for the vehicle or a placeholder
  const getMainImage = (vehicle) => {
    return vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";
  };

  // Check if vehicle is new (less than 7 days old)
  const isNewListing = (createdAt) => {
    if (!createdAt) return false;
    const createDate = new Date(createdAt);
    const now = new Date();
    const differenceInDays = Math.floor((now - createDate) / (1000 * 60 * 60 * 24));
    return differenceInDays < 7;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="w-full max-w-md mx-auto mb-8">
        <div className="relative bg-gray-200 rounded-full h-10 flex items-center px-2 shadow-sm">
          <div className="flex justify-between w-full">
            {vehicleCategories.map((category) => (
              <div key={category} className="relative flex-1 text-center">
                {selectedCategory === category && (
                  <div className="absolute -top-1 -bottom-1 -left-2 -right-2 bg-white rounded-full shadow-md z-0"></div>
                )}
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`relative z-10 w-full text-xs font-semibold transition-colors duration-200 py-2 ${
                    selectedCategory === category 
                      ? 'text-black' 
                      : 'text-gray-500 hover:text-black'
                  }`}
                >
                  {category === 'jeep/suv' ? 'Jeep/SUV' : 
                    category === 'double-cab' ? 'Double Cab' : 
                    category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading vehicles...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-auto max-w-lg">
          <p className="font-bold">Error loading vehicles</p>
          <p>{error}</p>
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow mx-auto max-w-lg">
          <p className="text-xl text-gray-600">No {selectedCategory} listings found</p>
          <p className="mt-2 text-gray-500">Try selecting a different category or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {filteredVehicles.map((vehicle) => (
            <div key={vehicle._id} className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg relative">
              {isNewListing(vehicle.createdAt) && (
                <div className="absolute top-0 left-0 z-10">
                  <div className="bg-green-500 rounded-br-full px-3 py-1">
                    <span className="text-xs text-white font-light">New</span>
                  </div>
                </div>
              )}
              
              <div className="h-40 flex items-center justify-center bg-gray-50">
                <img 
                  src={getMainImage(vehicle)} 
                  alt={vehicle.model} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                    e.target.onerror = null;
                  }}
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
                    {/* Show seller info */}
                    {vehicle.user && (
                      <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        Seller: {vehicle.user.name}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users size={16} />
                      <span>{vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{vehicle.transmission || 'N/A'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{vehicle.fuelType || 'N/A'}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-xs">{vehicle.mileage ? `${vehicle.mileage} km` : 'N/A'}</span>
                    </div>
                  </div>
                  
                  {/* Show contact info if available */}
                  {vehicle.mobile && (
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Phone size={14} />
                      <span>{vehicle.mobile}</span>
                    </div>
                  )}
                </div>
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Price</span>
                  <span className="text-base font-semibold text-gray-900">
                    ${formatPrice(vehicle.price)}
                  </span>
                </div>
                
                <Link href={`/vehicle-detail/${vehicle._id}`} className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg py-2 space-x-2 hover:bg-blue-700 transition-colors">
                  <span>View Now</span>
                  <ArrowRight size={20} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VehicleSelectionBar;