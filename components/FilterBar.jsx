"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, X, ChevronDown } from "lucide-react";

const FilterBar = () => {
  const [filters, setFilters] = useState({
    vehicle_type: "",
    model: "",
    year: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      vehicle_type: "",
      model: "",
      year: "",
      fuelType: "",
      minPrice: "",
      maxPrice: "",
    });
  };

  const applyFilters = () => {
    const queryParams = new URLSearchParams({
      ...(filters.vehicle_type && { vehicle_type: filters.vehicle_type }),
      ...(filters.model && { model: filters.model }),
      ...(filters.year && { year: filters.year }),
      ...(filters.fuelType && { fuelType: filters.fuelType }),
      ...(filters.minPrice && { minPrice: filters.minPrice }),
      ...(filters.maxPrice && { maxPrice: filters.maxPrice }),
    }).toString();

    router.push(`/filter-results?${queryParams}`);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  // Calculate active filters count
  const activeFiltersCount = Object.values(filters).filter(value => value !== "").length;

  return (
    <>
      {/* Mobile filter toggle button */}
      <div className="md:hidden w-full flex justify-between items-center p-4 bg-white sticky top-0 z-10 border-b">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-all"
        >
          <Filter size={18} />
          <span className="font-medium">Filters</span>
          {activeFiltersCount > 0 && (
            <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      {/* Sidebar container with overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 transition-opacity md:relative md:bg-transparent md:block ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto"
        }`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsOpen(false);
        }}
      >
        <div 
          className={`fixed left-0 top-0 bottom-0 bg-white w-full max-w-sm h-full overflow-y-auto transition-transform p-6 md:w-full md:static md:max-w-none md:transform-none md:rounded-lg md:shadow-md ${
            isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          }`}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Filter size={20} /> Filter Vehicles
            </h2>
            <button 
              onClick={() => setIsOpen(false)} 
              className="p-1 rounded-full hover:bg-gray-100 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-5">
            {/* Vehicle Type */}
            <div className="group">
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <div className="relative">
                <select
                  name="vehicle_type"
                  value={filters.vehicle_type}
                  onChange={handleFilterChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all"
                >
                  <option value="">All Types</option>
                  <option value="SUV">SUV</option>
                  <option value="Sedan">Sedan</option>
                  <option value="Truck">Truck</option>
                  <option value="Hatchback">Hatchback</option>
                  <option value="Coupe">Coupe</option>
                  <option value="Van">Van</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={filters.model}
                onChange={handleFilterChange}
                placeholder="e.g., Camry"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Year */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                placeholder="e.g., 2020"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>

            {/* Fuel Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <div className="relative">
                <select
                  name="fuelType"
                  value={filters.fuelType}
                  onChange={handleFilterChange}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 transition-all"
                >
                  <option value="">All Fuel Types</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Plug-in Hybrid">Plug-in Hybrid</option>
                </select>
                <ChevronDown size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Price Range</label>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min"
                    min="0"
                    className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <span className="text-gray-400">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max"
                    min="0"
                    className="w-full p-3 pl-7 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col space-y-3">
            <button
              onClick={applyFilters}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
            >
              <Filter size={16} className="mr-2" /> Apply Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 bg-white text-blue-600 text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            
            <button
              onClick={clearFilters}
              className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
            >
              Reset All
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterBar;