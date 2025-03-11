// Create this as a separate component file: components/VehicleSkeleton.jsx

import React from "react";

const VehicleSkeleton = () => {
  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden animate-pulse">
      {/* Image placeholder */}
      <div className="w-full h-48 bg-gray-100"></div>
      
      {/* Content placeholder */}
      <div className="p-4">
        {/* Title placeholder */}
        <div className="h-5 bg-gray-100 rounded w-3/4 mb-2"></div>
        
        {/* Price placeholder */}
        <div className="h-7 bg-gray-100 rounded w-1/3 mb-2"></div>
        
        {/* Details grid placeholder */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
          <div className="h-4 bg-gray-100 rounded"></div>
        </div>
        
        {/* Description placeholder */}
        <div className="h-4 bg-gray-100 rounded w-full mb-1"></div>
        <div className="h-4 bg-gray-100 rounded w-5/6 mb-3"></div>
        
        {/* Stats placeholder */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-gray-100 rounded w-1/3"></div>
          <div className="flex space-x-4">
            <div className="h-4 bg-gray-100 rounded w-10"></div>
            <div className="h-4 bg-gray-100 rounded w-10"></div>
          </div>
        </div>
        
        {/* Actions placeholder */}
        <div className="flex justify-between border-t pt-4">
          <div className="h-4 bg-gray-100 rounded w-16"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
          <div className="h-4 bg-gray-100 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

export default VehicleSkeleton;