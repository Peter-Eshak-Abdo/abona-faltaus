'use client';

export default function SkeletonLoader() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
        <div className="animate-pulse">
          {/* Header skeleton */}
          <div className="h-8 bg-gray-300 rounded mb-6"></div>

          {/* Grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>

            {/* Card 2 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-300 rounded flex-1"></div>
                <div className="h-10 bg-gray-300 rounded flex-1"></div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>

            {/* Card 4 */}
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="h-4 bg-gray-300 rounded mb-4"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
