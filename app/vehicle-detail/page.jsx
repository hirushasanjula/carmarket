'use client';

import React, { useState } from 'react';
import { Phone, Mail, MapPin, Share2, Flag, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VehicleDetailPage() {
  const [activeImage, setActiveImage] = useState(0);
  const [vehicle] = useState({
    id: '1',
    title: 'Toyota Prius 2018',
    price: 5800000,
    description: 'Well maintained Toyota Prius with full service history. Perfect condition with all original parts.',
    location: 'Colombo',
    seller: {
      name: 'John Doe',
      phone: '0771234567',
      email: 'john@example.com'
    },
    specs: {
      condition: 'Used',
      year: '2018',
      mileage: '45,000 km',
      transmission: 'Auto',
      fuelType: 'Hybrid',
      engineCapacity: '1800 cc'
    },
    features: [
      'Air Conditioning',
      'Power Steering',
      'Power Windows',
      'Power Mirrors',
      'ABS',
      'Airbags'
    ],
    images: [
      './Toyota Prius.jpg',
      '/Toyota Prius.jpg',
      '/Toyota Prius.jpg'
    ]
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={vehicle.images[activeImage]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4 grid grid-cols-4 gap-2">
                {vehicle.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`aspect-video rounded-lg overflow-hidden border-2 ${
                      activeImage === index ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`${vehicle.title} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(vehicle.specs).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key}</dt>
                    <dd className="text-base font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 mb-6">{vehicle.description}</p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {vehicle.features.map((feature) => (
                  <div key={feature} className="text-gray-600">• {feature}</div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.title}</h1>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  Rs. {vehicle.price.toLocaleString()}
                </p>
              </div>

              <div className="flex items-center text-gray-600 mb-6">
                <MapPin size={20} className="mr-2" />
                {vehicle.location}
              </div>

              <div className="space-y-3">
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                  <Phone size={20} />
                  <span>{vehicle.seller.phone}</span>
                </button>

                <button className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors">
                  <Mail size={20} />
                  <span>Email Seller</span>
                </button>
              </div>

              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <Share2 size={20} className="mr-2" />
                  Share
                </button>
                <button className="flex items-center text-gray-600 hover:text-red-600">
                  <Flag size={20} className="mr-2" />
                  Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
