import React from "react";
import { CiSearch } from "react-icons/ci";

const SearchBar = () => {
  return (
    <div className="flex justify-center items-center m-6">
      <div className="flex items-center gap-2 bg-gray-200 bg-opacity-40 p-2 w-full max-w-xs sm:max-w-sm md:max-w-md rounded-full">
        <div className="flex justify-center items-center w-6 h-6 p-1 ">
          <div className="w-4 h-4  rounded-full">
            <CiSearch width={24} height={24} />
          </div>
        </div>
        <input
          type="text"
          placeholder="Search"
          className="flex-grow bg-transparent outline-none text-black placeholder-gray-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;
