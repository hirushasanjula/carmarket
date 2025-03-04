'use client'; // Add this since we'll use hooks

import Image from 'next/image';
import { useState, useEffect } from 'react';

const HeroImageSlider = () => {
  // Array of image paths - add your image paths here
  const images = [
    '/car.jpeg',
    '/suv.png', // Add more images as needed
    '/car2.png',
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Changes every 3 seconds - adjust as needed

    return () => clearInterval(interval); // Cleanup on unmount
  }, [images.length]);

  return (
    <div className="flex justify-center items-center p-9">
      <div className="relative w-full max-w-lg">
        <Image
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          width={800}
          height={500}
          className="w-full h-auto max-w-lg object-cover transition-all duration-500 ease-in-out"
          priority={true} // Optional: improves loading for first image
        />
      </div>
    </div>
  );
};

export default HeroImageSlider;