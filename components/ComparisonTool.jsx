"use client";

import React from "react";
import { TrendingUp, TrendingDown, Gauge, BarChart2, Calendar, Clock } from "lucide-react";

const ComparisonTool = ({ price, year, mileage, comparison }) => {
  const formatPrice = (value) => (value ? value.toLocaleString() : "N/A");
  const formatMileage = (value) => (value ? `${value.toLocaleString()} km` : "N/A");

  if (!comparison) {
    return (
      <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Vehicle Comparison</h3>
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

  const getScoreBarWidth = (percentile) => {
    return `${Math.min(Math.max(percentile, 5), 95)}%`;
  };

  return (
    <div className="mt-6 p-6 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
      <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
        <BarChart2 className="mr-2" size={20} />
        Market Comparison
      </h3>
      <p className="text-sm text-gray-500 mb-6">
        Based on {comparison.similarCount} similar vehicles in the market
      </p>

      <div className="space-y-6">
        {/* Price Comparison */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              {isPriceLow && <TrendingDown className="mr-2 text-green-500" size={18} />}
              {isPriceHigh && <TrendingUp className="mr-2 text-red-500" size={18} />}
              {isPriceAvg && <Gauge className="mr-2 text-blue-500" size={18} />}
              <span className="font-medium">Price</span>
            </div>
            <span className="text-sm font-medium">Rs. {formatPrice(price)}</span>
          </div>

          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${
                isPriceLow ? "bg-green-500" : isPriceHigh ? "bg-red-500" : "bg-blue-500"
              }`}
              style={{ width: getScoreBarWidth(isPriceLow ? 30 : isPriceHigh ? 70 : 50) }}
            ></div>
          </div>

          <div className="text-sm text-gray-600">
            {isPriceLow && (
              <span className="text-green-600 font-medium">
                {Math.abs(priceDiff).toFixed(0)}% below 
              </span>
            )}
            {isPriceHigh && (
              <span className="text-red-600 font-medium">
                {priceDiff.toFixed(0)}% above 
              </span>
            )}
            {isPriceAvg && (
              <span className="text-blue-600 font-medium">
                Close to 
              </span>
            )}
            <span> market average (Rs. {formatPrice(comparison.price.average)})</span>
          </div>
        </div>

        {/* Year Comparison */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Calendar className="mr-2 text-gray-600" size={18} />
              <span className="font-medium">Year</span>
            </div>
            <span className="text-sm font-medium">{year}</span>
          </div>

          <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full ${
                isYearNewer ? "bg-green-500" : isYearOlder ? "bg-yellow-500" : "bg-blue-500"
              }`}
              style={{ width: getScoreBarWidth(comparison.year.percentile) }}
            ></div>
          </div>

          <div className="text-sm text-gray-600">
            {isYearNewer && (
              <span className="text-green-600 font-medium">
                Newer than {comparison.year.percentile}% 
              </span>
            )}
            {isYearOlder && (
              <span className="text-yellow-600 font-medium">
                Older than {100 - comparison.year.percentile}% 
              </span>
            )}
            {isYearAvg && (
              <span className="text-blue-600 font-medium">
                Similar to 
              </span>
            )}
            <span> of comparable vehicles (avg. {comparison.year.average})</span>
          </div>
        </div>

        {/* Mileage Comparison */}
        {comparison.mileage && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                <Clock className="mr-2 text-gray-600" size={18} />
                <span className="font-medium">Mileage</span>
              </div>
              <span className="text-sm font-medium">{formatMileage(mileage)}</span>
            </div>

            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full ${
                  isMileageLower ? "bg-green-500" : isMileageHigher ? "bg-yellow-500" : "bg-blue-500"
                }`}
                style={{ width: getScoreBarWidth(comparison.mileage.percentile) }}
              ></div>
            </div>

            <div className="text-sm text-gray-600">
              {isMileageLower && (
                <span className="text-green-600 font-medium">
                  Lower than {comparison.mileage.percentile}% 
                </span>
              )}
              {isMileageHigher && (
                <span className="text-yellow-600 font-medium">
                  Higher than {100 - comparison.mileage.percentile}% 
                </span>
              )}
              {isMileageAvg && (
                <span className="text-blue-600 font-medium">
                  Similar to 
                </span>
              )}
              <span> of comparable vehicles (avg. {formatMileage(comparison.mileage.average)})</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComparisonTool;