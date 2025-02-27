// components/Edit Box.jsx

"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

const EditVehicleModal = ({ vehicle, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    ...vehicle,
    // Handle special cases
    location: vehicle.location ? JSON.stringify(vehicle.location) : "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    // Handle number inputs
    if (type === "number") {
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
    
    try {
      // Format the data
      const submitData = { ...formData };
      
      // Parse location back to object if it's a string
      if (typeof submitData.location === "string" && submitData.location) {
        try {
          submitData.location = JSON.parse(submitData.location);
        } catch (error) {
          console.error("Error parsing location:", error);
        }
      }
      
      // Call the parent's onSave function
      await onSave(submitData);
    } catch (error) {
      console.error("Error updating vehicle:", error);
      alert("Failed to save changes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Type
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Condition
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Year
              </label>
              <input
                type="number"
                name="year"
                value={formData.year || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mileage (km)
              </label>
              <input
                type="number"
                name="mileage"
                value={formData.mileage || ""}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fuel Type
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Transmission
              </label>
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
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows="4"
              className="w-full p-2 border rounded-md"
            ></textarea>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Images
            </label>
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