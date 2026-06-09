"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

const Images = [
  {
    src: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Mountain landscape",
  },
  {
    src: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Forest mist",
  },
  {
    src: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    alt: "Wooden pathway",
  },
];
export default function Carousel() {
  const [curIndex, setCurIndex] = useState(0);
  const prevImage = () => {
    setCurIndex((prev) => (prev === 0 ? Images.length - 1 : prev - 1));
  };
  const nextImage = () => {
    setCurIndex((prev) => (prev === Images.length - 1 ? 0 : prev + 1));
  };

  // auto play feature
  useEffect(() => {
    const timer = setInterval(nextImage, 2000);
    return () => clearInterval(timer);
  }, [curIndex]);
  return (
    <div className="relative w-full overflow-hidden h-150 group">
      {/* slides container */}
      <div
        className="flex h-full w-full transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${curIndex * 100}%)` }}
      >
        {Images.map((image, index) => (
          <div key={index} className="w-full h-full flex-shrink-0 relative">
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      {/* Left Navigation Arrow */}
      <button
        onClick={prevImage}
        className="hidden group-hover:flex absolute top-1/2 left-4 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        aria-label="Previous slide"
      >
        &#10094;
      </button>

      {/* Right Navigation Arrow */}
      <button
        onClick={nextImage}
        className="hidden group-hover:flex absolute top-1/2 right-4 -translate-y-1/2 items-center justify-center w-10 h-10 rounded-full bg-black/40 text-white hover:bg-black/60 transition"
        aria-label="Next slide"
      >
        &#10095;
      </button>
    </div>
  );
}
