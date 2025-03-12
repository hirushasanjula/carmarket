"use client";

import { Search, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const SearchBar = ({ scrolled }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!searchQuery || !isExpanded) {
      setSearchResults([]);
      setError(null);
      return;
    }

    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles?showAll=true&search=${encodeURIComponent(searchQuery)}`);
        console.log("Search fetch status:", response.status, "Query:", searchQuery);
        if (!response.ok) {
          const errorText = await response.text();
          console.log("Search fetch error response:", errorText);
          throw new Error(`Failed to fetch search results: ${response.status} - ${errorText}`);
        }
        const data = await response.json();
        setSearchResults(data);
        setLoading(false);
      } catch (err) {
        console.error("Search error:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery, isExpanded]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsExpanded(false);
      setSearchQuery("");
      setSearchResults([]);
    }, 200);
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : "/api/placeholder/400/300";

  return (
    <div className="relative">
      <div
        className={`relative transition-all duration-300 ${
          isExpanded ? "w-64" : "w-10"
        }`}
      >
        <form onSubmit={handleSearch} className="flex items-center">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onBlur={handleBlur}
            placeholder="Search by model or year..."
            className={`peer rounded-full py-2 pl-9 pr-4 text-sm outline-none transition-all duration-300 ${
              isExpanded ? "w-full opacity-100" : "w-0 opacity-0"
            } ${
              scrolled
                ? "bg-gray-100 placeholder-gray-500 text-gray-800 focus:ring-2 focus:ring-blue-500/50"
                : "bg-white placeholder-blue-200 text-gray-800 focus:ring-2 focus:ring-blue-500/50"
            }`}
          />
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`absolute left-0 top-0 p-2 rounded-full transition-all duration-300 ${
              scrolled
                ? "text-blue-600 hover:bg-blue-50"
                : "text-blue-600 hover:bg-blue-100"
            }`}
          >
            <Search size={16} />
          </button>
        </form>
      </div>

      {isExpanded && searchQuery && (
        <div className="absolute z-10 mt-2 w-64 max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg border border-gray-200">
          {loading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : error ? (
            <div className="p-4 text-center text-red-500">{error}</div>
          ) : searchResults.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No vehicles found</div>
          ) : (
            searchResults.map((vehicle) => (
              <Link
                key={vehicle._id}
                href={`/vehicle-detail/${vehicle._id}`}
                className="flex items-center p-3 hover:bg-gray-100 transition-colors"
                onClick={() => {
                  setIsExpanded(false);
                  setSearchQuery("");
                }}
              >
                <img
                  src={getMainImage(vehicle)}
                  alt={vehicle.model}
                  className="w-16 h-12 object-cover rounded-md mr-3"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {vehicle.year} {vehicle.model}
                  </p>
                  <p className="text-xs text-gray-600">${formatPrice(vehicle.price)}</p>
                </div>
                <ArrowRight size={16} className="text-blue-600" />
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;