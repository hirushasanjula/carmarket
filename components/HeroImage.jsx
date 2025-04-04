"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

const HeroImageSlider = () => {
  const images = ["/car.jpeg", "/suv.png", "/car2.png"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);
    return () => clearInterval(interval);
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
          priority={true}
        />
      </div>
    </div>
  );
};

export default HeroImageSlider;