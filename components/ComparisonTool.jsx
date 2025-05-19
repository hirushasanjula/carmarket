"use client";

import React from "react";
import { TrendingUp, TrendingDown, Gauge, BarChart2, Calendar, Clock, Info } from "lucide-react";

const ComparisonTool = ({ price, year, mileage, comparison }) => {
  const formatPrice = (value) => (value ? value.toLocaleString() : "N/A");
  const formatMileage = (value) => (value ? `${value.toLocaleString()} km` : "N/A");

  if (!comparison) {
    return (
      <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
          <BarChart2 className="mr-2 text-blue-600" size={22} />
          Market Value Analysis
        </h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          No similar vehicles found for comparison.
        </div>
      </div>
    );
  }

  const priceDiff = ((price - comparison.price.average) / comparison.price.average) * 100;
  const isPriceLow = priceDiff < -5;
  const isPriceHigh = priceDiff > 5;
  const isPriceAvg = !isPriceLow && !isPriceHigh;

  const isYearNewer = comparison.year.percentile > 60;
  const isYearOlder = comparison.year.percentile < 40;
  const isYearAvg = !isYearNewer && !isYearOlder;

  const isMileageLower = comparison.mileage && comparison.mileage.percentile > 60;
  const isMileageHigher = comparison.mileage && comparison.mileage.percentile < 40;
  const isMileageAvg = comparison.mileage && !isMileageLower && !isMileageHigher;

  // Market score calculation (simple weighted average)
  const priceScore = isPriceLow ? 90 : isPriceHigh ? 60 : 75; 
  const yearScore = isYearNewer ? 85 : isYearOlder ? 65 : 75;
  const mileageScore = isMileageLower ? 90 : isMileageHigher ? 60 : 75;
  
  // Weight factors (price matters most)
  const marketScore = Math.round((priceScore * 0.5) + (yearScore * 0.25) + (mileageScore * 0.25));
  
  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 70) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreText = (score) => {
    if (score >= 80) return "Excellent Value";
    if (score >= 70) return "Good Value";
    if (score >= 60) return "Fair Value";
    return "Overpriced";
  };

  return (
    <div className="mt-8 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header with market score */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-5 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold flex items-center">
              <BarChart2 className="mr-2" size={22} />
              Market Value Analysis
            </h3>
            <p className="text-sm text-blue-100 mt-1">
              Based on {comparison.similarCount} similar vehicles
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="grid md:grid-cols-3 gap-5">
          {/* Price Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${
              isPriceLow ? "bg-green-500" : isPriceHigh ? "bg-red-500" : "bg-blue-500"
            } rotate-45 translate-x-8 -translate-y-8 opacity-10`}></div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {isPriceLow && <TrendingDown className="mr-2 text-green-500" size={20} />}
                {isPriceHigh && <TrendingUp className="mr-2 text-red-500" size={20} />}
                {isPriceAvg && <Gauge className="mr-2 text-blue-500" size={20} />}
                <h4 className="font-semibold text-lg">Price</h4>
              </div>
              <span className={`text-xl font-bold ${
                isPriceLow ? "text-green-600" : isPriceHigh ? "text-red-600" : "text-blue-600"
              }`}>
                Rs. {formatPrice(price)}
              </span>
            </div>
            
            <div className="mt-4 h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isPriceLow ? "bg-green-500" : isPriceHigh ? "bg-red-500" : "bg-blue-500"
                }`}
                style={{ 
                  width: `${isPriceLow ? 25 : isPriceHigh ? 75 : 50}%`,
                  transition: "width 0.5s ease-in-out" 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span>Lower</span>
              <span>Average</span>
              <span>Higher</span>
            </div>
            
            <div className="mt-3 text-sm">
              {isPriceLow && (
                <span className="font-medium">
                  <span className="text-green-600">{Math.abs(priceDiff).toFixed(0)}% below</span> market average
                </span>
              )}
              {isPriceHigh && (
                <span className="font-medium">
                  <span className="text-red-600">{priceDiff.toFixed(0)}% above</span> market average
                </span>
              )}
              {isPriceAvg && (
                <span className="font-medium">
                  <span className="text-blue-600">Close to</span> market average
                </span>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Market average: Rs. {formatPrice(comparison.price.average)}
            </div>
          </div>

          {/* Year Card */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${
              isYearNewer ? "bg-green-500" : isYearOlder ? "bg-yellow-500" : "bg-blue-500"
            } rotate-45 translate-x-8 -translate-y-8 opacity-10`}></div>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Calendar className={`mr-2 ${
                  isYearNewer ? "text-green-500" : isYearOlder ? "text-yellow-500" : "text-blue-500"
                }`} size={20} />
                <h4 className="font-semibold text-lg">Year</h4>
              </div>
              <span className={`text-xl font-bold ${
                isYearNewer ? "text-green-600" : isYearOlder ? "text-yellow-600" : "text-blue-600"
              }`}>
                {year}
              </span>
            </div>
            
            <div className="mt-4 h-3 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  isYearNewer ? "bg-green-500" : isYearOlder ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ 
                  width: `${comparison.year.percentile}%`,
                  transition: "width 0.5s ease-in-out" 
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-xs mt-1">
              <span>Older</span>
              <span>Average</span>
              <span>Newer</span>
            </div>
            
            <div className="mt-3 text-sm">
              {isYearNewer && (
                <span className="font-medium">
                  <span className="text-green-600">Newer than {comparison.year.percentile}%</span> of similar vehicles
                </span>
              )}
              {isYearOlder && (
                <span className="font-medium">
                  <span className="text-yellow-600">Older than {100 - comparison.year.percentile}%</span> of similar vehicles
                </span>
              )}
              {isYearAvg && (
                <span className="font-medium">
                  <span className="text-blue-600">Similar year</span> to market average
                </span>
              )}
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Average year: {comparison.year.average}
            </div>
          </div>

          {/* Mileage Card */}
          {comparison.mileage && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 shadow-sm relative overflow-hidden">
              <div className={`absolute top-0 right-0 w-16 h-16 ${
                isMileageLower ? "bg-green-500" : isMileageHigher ? "bg-yellow-500" : "bg-blue-500"
              } rotate-45 translate-x-8 -translate-y-8 opacity-10`}></div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <Clock className={`mr-2 ${
                    isMileageLower ? "text-green-500" : isMileageHigher ? "text-yellow-500" : "text-blue-500"
                  }`} size={20} />
                  <h4 className="font-semibold text-lg">Mileage</h4>
                </div>
                <span className={`text-xl font-bold ${
                  isMileageLower ? "text-green-600" : isMileageHigher ? "text-yellow-600" : "text-blue-600"
                }`}>
                  {formatMileage(mileage)}
                </span>
              </div>
              
              <div className="mt-4 h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    isMileageLower ? "bg-green-500" : isMileageHigher ? "bg-yellow-500" : "bg-blue-500"
                  }`}
                  style={{ 
                    width: `${comparison.mileage.percentile}%`,
                    transition: "width 0.5s ease-in-out" 
                  }}
                ></div>
              </div>
              
              <div className="flex justify-between text-xs mt-1">
                <span>Higher</span>
                <span>Average</span>
                <span>Lower</span>
              </div>
              
              <div className="mt-3 text-sm">
                {isMileageLower && (
                  <span className="font-medium">
                    <span className="text-green-600">Lower than {comparison.mileage.percentile}%</span> of similar vehicles
                  </span>
                )}
                {isMileageHigher && (
                  <span className="font-medium">
                    <span className="text-yellow-600">Higher than {100 - comparison.mileage.percentile}%</span> of similar vehicles
                  </span>
                )}
                {isMileageAvg && (
                  <span className="font-medium">
                    <span className="text-blue-600">Similar mileage</span> to market average
                  </span>
                )}
              </div>
              
              <div className="mt-2 text-sm text-gray-500">
                Average mileage: {formatMileage(comparison.mileage.average)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComparisonTool;