"use client";

import React from "react";
import Image from "next/image";

// Define the structure of a logo item
interface LogoItem {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// Real rugby club logos from teams around the world
const rugbyLogos: LogoItem[] = [
  {
    src: "https://1000logos.net/wp-content/uploads/2021/05/New-South-Wales-Waratahs-logo-500x281.png",
    alt: "New South Wales Waratahs",
    width: 120,
    height: 60,
  },
  {
    src: "https://assets.stickpng.com/thumbs/5ae2e54f33b73fa43b1a898f.png",
    alt: "Stormers",
    width: 120,
    height: 60,
  },
  {
    src: "https://assets.stickpng.com/thumbs/5ae2e4d833b73fa43b1a8980.png",
    alt: "Sharks",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2021/05/Queensland-Reds-logo-500x281.png",
    alt: "Queensland Reds",
    width: 120,
    height: 60,
  },
  {
    src: "https://assets.stickpng.com/thumbs/5ae2e4c433b73fa43b1a897d.png",
    alt: "ACT Brumbies",
    width: 120,
    height: 60,
  },
  {
    src: "https://assets.stickpng.com/thumbs/5ae2e51133b73fa43b1a8988.png",
    alt: "New Zealand All Blacks",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/England-Rugby-Logo-500x281.png",
    alt: "England Rugby",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/Ireland-Rugby-Logo-500x281.png",
    alt: "Ireland Rugby",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/France-Rugby-Logo-500x281.png",
    alt: "France Rugby",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/South-Africa-Rugby-Logo-500x281.png",
    alt: "South Africa Rugby",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/Wales-Rugby-Logo-500x281.png",
    alt: "Wales Rugby",
    width: 120,
    height: 60,
  },
  {
    src: "https://1000logos.net/wp-content/uploads/2020/09/Scotland-Rugby-Logo-500x281.png",
    alt: "Scotland Rugby",
    width: 120,
    height: 60,
  },
];

// Duplicate the array to create a seamless infinite scroll effect
const marqueeLogos = [...rugbyLogos, ...rugbyLogos];

const CustomersWeServe: React.FC = () => {
  return (
    <section className="w-full bg-white py-2 md:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          
          {/* LEFT SIDE - STATIC CONTENT */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Customers we serve
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Trusted by rugby clubs and organizations worldwide.
            </p>
            {/* Brand name from your image */}
            
          </div>

          {/* RIGHT SIDE - SCROLLING MARQUEE (RTL) */}
          <div className="relative w-full overflow-hidden">
            {/* Gradient fade edges for a smooth effect */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none"></div>
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none"></div>

            {/* Scrolling container */}
            <div className="flex animate-marquee-rtl whitespace-nowrap">
              {marqueeLogos.map((logo, index) => (
                <div
                  key={`${logo.alt}-${index}`}
                  className="inline-flex mx-4 flex-shrink-0 items-center justify-center"
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={logo.width}
                    height={logo.height}
                    className="object-contain max-w-none"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tailwind custom animation for right-to-left marquee */}
      <style jsx>{`
        @keyframes marquee-rtl {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee-rtl {
          animation: marquee-rtl 30s linear infinite;
        }
      `}</style>
    </section>
  );
};

export default CustomersWeServe;