"use client";

import { Search } from "lucide-react";
import { useState } from "react";

const SearchBar = ({ scrolled }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
    setSearchQuery("");
    setIsExpanded(false);
  };

  return (
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
          placeholder="Search cars..."
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
  );
};

export default SearchBar;