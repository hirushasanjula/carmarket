"use client";

import { useState, useRef } from 'react';
import Image from 'next/image';
import { MapPinIcon, XCircleIcon } from 'lucide-react';

export default function VehicleListingForm() {
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    vehicle_type: '',
    model: '',
    vehicle_condition: '',
    year: '',
    price: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    location: {
      coordinates: null,
      address: '',
    },
    description: '',
    images: [],
  });
  
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationSearching, setLocationSearching] = useState(false);
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'year' || name === 'price' || name === 'mileage') {
      setFormData({ ...formData, [name]: value ? Number(value) : '' });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleImageUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      if (formData.images.length + newFiles.length > 5) {
        setError('Maximum 5 images allowed');
        return;
      }
      
      setFormData({ ...formData, images: [...formData.images, ...newFiles] });
      
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviewUrls]);
    }
  };
  
  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    
    const newPreviews = [...imagePreviewUrls];
    URL.revokeObjectURL(newPreviews[index]); // Release object URL
    newPreviews.splice(index, 1);
    
    setFormData({ ...formData, images: newImages });
    setImagePreviewUrls(newPreviews);
  };
  
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setLocationSearching(true);
    
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      
      const { latitude, longitude } = position.coords;
      
      const address = `Location at ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      
      setFormData({
        ...formData,
        location: {
          coordinates: [longitude, latitude], // MongoDB uses [longitude, latitude]
          address
        }
      });
    } catch (err) {
      setError('Failed to get your location');
    } finally {
      setLocationSearching(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    if (!formData.model || !formData.year || !formData.price || !formData.vehicle_type || !formData.vehicle_condition) {
      setError('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }
    
    try {
      const submitData = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'images') {
          formData.images.forEach(file => {
            submitData.append('images', file);
          });
        } else if (key === 'location') {
          submitData.append(key, JSON.stringify(value));
        } else {
          submitData.append(key, String(value));
        }
      });
      
      console.log('Submitting form data...');
      
      // Send the data to the API
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        body: submitData,
      });
      
      console.log('Response status:', response.status);
      
      // Always try to parse the response, even if not 2xx
      const result = await response.json().catch(err => {
        console.error('Failed to parse response as JSON:', err);
        return { error: 'Invalid response format' };
      });
      
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || result.details || 'Failed to create vehicle listing');
      }
      
      if (!result.success) {
        throw new Error(result.message || 'Operation did not complete successfully');
      }
      
      // Reset form after successful submission
      setFormData({
        vehicle_type: '',
        model: '',
        vehicle_condition: '',
        year: '',
        price: '',
        mileage: '',
        fuelType: '',
        transmission: '',
        location: {
          coordinates: null,
          address: '',
        },
        description: '',
        images: [],
      });
      setImagePreviewUrls([]);
      
      // Show success message
      alert('Vehicle listing created successfully! It is pending admin approval.');
      
    } catch (err) {
      console.error('Form submission error:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mt-12 mx-auto p-4 md:p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Vehicle Listing</h1>
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vehicle Basic Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="vehicle_type" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Type <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicle_type"
              name="vehicle_type"
              value={formData.vehicle_type}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="car">Car</option>
              <option value="van">Van</option>
              <option value="jeep/suv">Jeep/SUV</option>
              <option value="double-cab">Double Cab</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="model" className="block text-sm font-medium text-gray-700 mb-1">
              Model <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="e.g. Toyota Corolla"
              required
            />
          </div>
        </div>
        
        {/* Vehicle Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label htmlFor="vehicle_condition" className="block text-sm font-medium text-gray-700 mb-1">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              id="vehicle_condition"
              name="vehicle_condition"
              value={formData.vehicle_condition}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            >
              <option value="">Select Condition</option>
              <option value="brand-new">Brand New</option>
              <option value="used">Used</option>
              <option value="unregister">Unregistered</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
              Year <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              min="1900"
              max={new Date().getFullYear() + 1}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label htmlFor="fuelType" className="block text-sm font-medium text-gray-700 mb-1">
              Fuel Type
            </label>
            <select
              id="fuelType"
              name="fuelType"
              value={formData.fuelType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Fuel Type</option>
              <option value="Petrol">Petrol</option>
              <option value="Diesel">Diesel</option>
              <option value="Electric">Electric</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="transmission" className="block text-sm font-medium text-gray-700 mb-1">
              Transmission
            </label>
            <select
              id="transmission"
              name="transmission"
              value={formData.transmission}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Transmission</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
        </div>
        
        {/* Price and Mileage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
              Price <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full p-2 pl-8 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0.00"
                min="0"
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-1">
              Mileage
            </label>
            <div className="relative">
              <input
                type="number"
                id="mileage"
                name="mileage"
                value={formData.mileage}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. 50000"
                min="0"
              />
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500">
                km
              </span>
            </div>
          </div>
        </div>
        
        {/* Location */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={formData.location.address}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, address: e.target.value }
              })}
              className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter your location"
            />
            <button
              type="button"
              onClick={getCurrentLocation}
              className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={locationSearching}
            >
              <MapPinIcon className="w-5 h-5" />
            </button>
          </div>
          {locationSearching && <p className="text-sm text-gray-500">Getting your location...</p>}
        </div>
        
        {/* Vehicle Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={4}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Describe your vehicle..."
          />
        </div>
        
        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload Images (Max 5)
          </label>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            {imagePreviewUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-4 aspect-h-3 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={url}
                    alt={`Vehicle image ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                    className="w-full h-full object-center object-cover"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <XCircleIcon className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}
            
            {formData.images.length < 5 && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="aspect-w-4 aspect-h-3 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-500 transition-colors"
              >
                <div className="text-center p-4">
                  <p className="mt-1 text-xs text-gray-500">Click to add</p>
                </div>
              </button>
            )}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Creating Listing...' : 'Create Listing'}
          </button>
        </div>
      </form>
    </div>
  );
}