import React from 'react';

/**
 * This page serves as a basic debug and test endpoint.
 * It's designed to provide server-side information, useful for verifying deployment
 * and environment configurations, especially in response to vague testing tasks.
 *
 * The `dynamic = 'force-dynamic'` ensures that this page is always rendered
 * dynamically on the server, preventing static optimization and ensuring fresh data.
 */
export const dynamic = 'force-dynamic';

export default function DebugPage() {
  // Get the current time on the server, formatted for display.
  const currentTime = new Date().toLocaleString('en-US', {
    timeZone: 'UTC',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  // Retrieve the Node.js environment, defaulting to 'development' if not set.
  const environment = process.env.NODE_ENV || 'development';

  return (
    <div className="container mx-auto p-4 max-w-2xl bg-white shadow-lg rounded-lg mt-8">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4 border-b pb-2">
        Debug Test Page: ✅ Test 12:10:11
      </h1>
      <p className="text-lg text-gray-700 mb-6">
        This page serves as a placeholder for debugging and testing purposes,
        as per the task description: &quot;Test من debug script&quot;.
        It provides basic server-side context.
      </p>

      <div className="bg-blue-50 p-6 rounded-md border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-800 mb-3">Server Information</h2>
        <p className="text-gray-800 mb-2">
          <strong className="font-medium">Current UTC Time:</strong> {currentTime}
        </p>
        <p className="text-gray-800 mb-2">
          <strong className="font-medium">Environment:</strong> <span className="font-mono text-sm bg-blue-100 px-2 py-1 rounded">{environment}</span>
        </p>
        {/* Additional debug information can be added here as needed, e.g., specific environment variables, feature flags, build info */}
      </div>

      <p className="mt-6 text-sm text-gray-500 italic">
        This page is dynamically rendered on the server to ensure up-to-date information.
      </p>
    </div>
  );
}
