// Server-side page component
import { Suspense } from "react";
import FilterResultsClient from "./FilterResultsClient"; // New client component

export default function FilterResults() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Filtered Vehicles</h1>
      <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
        <FilterResultsClient />
      </Suspense>
    </div>
  );
}