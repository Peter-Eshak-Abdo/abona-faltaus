import EaglesLogo from '@/components/EaglesLogo';
import React from 'react';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-50 text-gray-900">
      <h1 className="text-5xl font-extrabold mb-8 text-blue-700">
        Welcome to the Grand Competition!
      </h1>
      <p className="text-xl mb-12 max-w-2xl text-center leading-relaxed">
        Witness the spirit of competition, proudly represented by the official Eagles emblem throughout the event.
      </p>
      
      <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-lg shadow-lg">
        <EaglesLogo width={180} height={180} className="drop-shadow-md" />
        <p className="text-lg font-medium text-gray-700">Our symbol of excellence and unity.</p>
      </div>

      <div className="mt-20 text-center p-6 bg-blue-50 rounded-lg shadow-inner">
        <h2 className="text-3xl font-semibold mb-4 text-blue-600">Featured in All Sections</h2>
        <p className="text-md text-gray-600 mb-6">The Eagles logo is seamlessly integrated across all competition pages and materials.</p>
        <div className="flex justify-center items-center gap-8">
          <div className="flex flex-col items-center">
            <EaglesLogo width={70} height={70} className="opacity-80 hover:opacity-100 transition-opacity duration-200" />
            <span className="text-sm text-gray-500 mt-2">Header Icon</span>
          </div>
          <div className="flex flex-col items-center">
            <EaglesLogo width={100} height={100} className="border-2 border-blue-300 rounded-full p-1" />
            <span className="text-sm text-gray-500 mt-2">Profile Badge</span>
          </div>
          <div className="flex flex-col items-center">
            <EaglesLogo width={60} height={60} className="grayscale hover:grayscale-0 transition-all duration-300" />
            <span className="text-sm text-gray-500 mt-2">Footer Mark</span>
          </div>
        </div>
      </div>
    </main>
  );
}
