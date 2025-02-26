'use client';

import React, { useState } from 'react';
import { Users, ArrowRight } from 'lucide-react';
import { vehicleInventory } from '@/lib/vehicleData';
import Link from 'next/link';

const VehicleSelectionBar = () => {
  const [selectedCategory, setSelectedCategory] = useState('New');
  const vehicleCategories = ['New', 'Car', 'Van', 'Truck', 'Jeep'];

  const filteredVehicles = vehicleInventory.filter(vehicle => vehicle.category === selectedCategory);

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
                  {category}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4  justify-center">
        {filteredVehicles.map((vehicle, index) => (
          <div key={index} className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-md overflow-hidden transition-all hover:shadow-lg relative">
            {vehicle.isNew && (
              <div className="absolute top-0 left-0 z-10">
                <div className="bg-green-500 rounded-br-full px-3 py-1">
                  <span className="text-xs text-white font-light">New</span>
                </div>
              </div>
            )}
            
            <div className="h-40 flex items-center justify-center bg-gray-50">
              <img 
                src={vehicle.image} 
                alt={vehicle.name} 
                className="max-w-full max-h-full object-contain"
              />
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-neutral-800">{vehicle.name}</h2>
                <div className="flex items-center space-x-2 text-xs text-gray-600">
                  <span className="font-medium">{vehicle.rating.toFixed(1)}</span>
                  <span>({vehicle.reviewCount.toLocaleString()} reviews)</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>{vehicle.passengers} Passengers</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{vehicle.transmission}</span>
                  </div>
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">
                      {vehicle.airConditioning ? 'Air Conditioning' : 'No A/C'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-xs">{vehicle.doors} Doors</span>
                  </div>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Price</span>
                <span className="text-base font-semibold text-gray-900">
                  ${vehicle.price.toLocaleString()}
                </span>
              </div>
              
              <Link href='/vehicle-detail' className="w-full flex items-center justify-center bg-blue-600 text-white rounded-lg py-2 space-x-2 hover:bg-blue-700 transition-colors">
                <span>View Now</span>
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelectionBar;
