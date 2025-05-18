"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditVehicleModal = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...vehicle,
    location: vehicle.location || { region: "", city: "" },
    contactPhone: vehicle.contactPhone || "",
    contactEmail: vehicle.contactEmail || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comparison, setComparison] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComparison = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicle._id}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch vehicle data: ${response.statusText}`);
        }
        const vehicleData = await response.json();
        setComparison(vehicleData.comparison);
      } catch (error) {
        console.error("Error fetching comparison:", error);
        setError("Unable to load comparison data. You can still edit the listing.");
      }
    };
    fetchComparison();
  }, [vehicle._id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "region" || name === "city") {
      setFormData({
        ...formData,
        location: {
          ...formData.location,
          [name]: value,
        },
      });
    } else if (type === "number") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Number(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const submitData = { ...formData };

      if (!submitData.location.region || !submitData.location.city) {
        throw new Error("Region and city are required");
      }
      if (!submitData.model || !submitData.year || !submitData.price || !submitData.vehicle_type || !submitData.vehicle_condition) {
        throw new Error("Please fill in all required fields");
      }

      await onSave(submitData);
      onClose();
    } catch (error) {
      console.error("Error updating vehicle:", error);
      setError(error.message || "Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (value) => (value ? value.toLocaleString() : "N/A");
  const formatMileage = (value) => (value ? `${value.toLocaleString()} km` : "N/A");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Edit Vehicle Listing</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-2 bg-red-100 text-red-600 rounded">
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
              <select
                name="vehicle_type"
                value={formData.vehicle_type || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Type</option>
                <option value="car">Car</option>
                <option value="van">Van</option>
                <option value="jeep/suv">Jeep/SUV</option>
                <option value="double-cab">Double Cab</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
              <input
                type="text"
                name="model"
                value={formData.model || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                name="vehicle_condition"
                value={formData.vehicle_condition || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              >
                <option value="">Select Condition</option>
                <option value="brand-new">Brand New</option>
                <option value="used">Used</option>
                <option value="unregister">Unregistered</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
              {comparison && (
                <p className="text-sm text-gray-500 mt-1">
                  Suggested year: {comparison.year.average}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs.)</label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
              {comparison && (
                <p className="text-sm text-gray-500 mt-1">
                  Suggested price: Rs. {formatPrice(comparison.price.average)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mileage (km)</label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
              {comparison && comparison.mileage && (
                <p className="text-sm text-gray-500 mt-1">
                  Suggested mileage: {formatMileage(comparison.mileage.average)}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <select
                name="fuelType"
                value={formData.fuelType || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Fuel Type</option>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="Electric">Electric</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Transmission</label>
              <select
                name="transmission"
                value={formData.transmission || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              >
                <option value="">Select Transmission</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
              <input
                type="text"
                name="region"
                value={formData.location.region || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                name="city"
                value={formData.location.city || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., +94 123 456 789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                placeholder="e.g., seller@example.com"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Images</label>
            <div className="grid grid-cols-3 gap-2">
              {formData.images && formData.images.length > 0 ? (
                formData.images.map((image, index) => (
                  <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                    <img
                      src={image}
                      alt={`Vehicle image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/api/placeholder/100/100";
                        e.target.onerror = null;
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-gray-500 text-sm">No images available</div>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              To change images, please use the Add New Vehicle form.
            </p>
          </div>

          <div className="flex justify-end gap-2 border-t pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditVehicleModal;