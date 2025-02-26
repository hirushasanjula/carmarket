import React from 'react';
import { Users, ArrowRight, Car, Wind } from 'lucide-react';

const VehicleCard = ({
  name,
  rating,
  reviewCount,
  passengers,
  transmission,
  airConditioning,
  doors,
  price,
  imageUrl
}) => {
  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="relative h-48 flex items-center justify-center bg-gray-50">
        <img 
          src={imageUrl} 
          alt={name} 
          className="max-w-full max-h-full object-contain rounded-lg"
        />
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h2 className="text-base font-medium text-neutral-800">{name}</h2>
          <div className="flex items-center space-x-1.5 text-xs text-gray-600 mt-1">
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-gray-400">({reviewCount.toLocaleString()} reviews)</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1.5">
              <Users size={20} className="text-gray-400" />
              <span>{passengers} Passengers</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Car size={20} className="text-gray-400" />
              <span>{transmission}</span>
            </div>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-1.5">
              <Wind size={20} className="text-gray-400" />
              <span>{airConditioning ? 'Air Conditioning' : 'No A/C'}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Car size={20} className="text-gray-400" />
              <span>{doors} Doors</span>
            </div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Price</span>
          <span className="text-base font-semibold text-gray-900">
            ${price.toLocaleString()}
          </span>
        </div>

        <button className="w-full flex items-center justify-center bg-green-500 text-white rounded-lg py-2.5 space-x-2 hover:bg-green-600 transition-colors">
          <span>View Now</span>
          <ArrowRight size={20} />
        </button>
      </div>
    </div>
  );
};

const MostViewCardList = () => {
  const vehicles = [
    {
      name: 'Benz C-Class',
      rating: 4.5,
      reviewCount: 2036,
      passengers: 4,
      transmission: 'Auto',
      airConditioning: true,
      doors: 4,
      price: 1600,
      imageUrl: 'https://via.placeholder.com/185x101'
    }
  ];

  return (
    <div className="container mx-auto m-10 px-4 py-8">
      <div className="text-center mb-16">
        <div className="inline-flex bg-green-500/20 mb-10 rounded-lg px-4 py-2">
          <span className="text-green-600 text-sm font-medium">Most Viewed</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((vehicle, index) => (
          <VehicleCard key={index} {...vehicle} />
        ))}
      </div>
    </div>
  );
};

export default MostViewCardList;
