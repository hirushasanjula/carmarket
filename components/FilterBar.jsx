"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter } from "lucide-react";

const FilterBar = () => {
  const [filters, setFilters] = useState({
    vehicle_type: "",
    model: "",
    year: "",
    fuelType: "",
    minPrice: "",
    maxPrice: "",
  });
  const router = useRouter();

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
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
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Filter Vehicles</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Vehicle Type</label>
          <input
            type="text"
            name="vehicle_type"
            value={filters.vehicle_type}
            onChange={handleFilterChange}
            placeholder="e.g., SUV"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Model</label>
          <input
            type="text"
            name="model"
            value={filters.model}
            onChange={handleFilterChange}
            placeholder="e.g., Camry"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Year</label>
          <input
            type="number"
            name="year"
            value={filters.year}
            onChange={handleFilterChange}
            placeholder="e.g., 2020"
            min="1900"
            max={new Date().getFullYear()}
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Fuel Type</label>
          <input
            type="text"
            name="fuelType"
            value={filters.fuelType}
            onChange={handleFilterChange}
            placeholder="e.g., Petrol"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Min Price</label>
          <input
            type="number"
            name="minPrice"
            value={filters.minPrice}
            onChange={handleFilterChange}
            placeholder="e.g., 10000"
            min="0"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Max Price</label>
          <input
            type="number"
            name="maxPrice"
            value={filters.maxPrice}
            onChange={handleFilterChange}
            placeholder="e.g., 50000"
            min="0"
            className="mt-1 w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
          />
        </div>
      </div>
      <button
        onClick={applyFilters}
        className="mt-6 flex items-center justify-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
      >
        <Filter size={16} className="mr-2" /> Apply Filters
      </button>
    </div>
  );
};

export default FilterBar;