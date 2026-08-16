import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,

  fallbacks: {
    document: "/~offline",
  },

  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /\/api\/.*/,
        handler: "NetworkOnly",
        options: {
          cacheName: "api-calls",
        },
      },
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern:
          /\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif|mp3|wav|ogg|m4a|json|pdf)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets-cache",
          expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /_next\/static\/.+/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern:
          /https:\/\/(?:firebasestorage\.googleapis\.com|lh3\.googleusercontent\.com)\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "remote-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      {
        urlPattern: /^https:\/\/archive\.org\/download\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "archive-audio-cache",
          expiration: {
            maxEntries: 500,
            maxAgeSeconds: 60 * 60 * 24 * 365 * 5,
          },
          cacheableResponse: {
            statuses: [0, 200],
          },
          rangeRequests: true,
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  logging: {
    fetches: {
      fullUrl: true,
    },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "via.placeholder.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "archive.org" },
      {
        protocol: "https",
        hostname: "xginokdunnhesgohymja.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*).(jpg|jpeg|png|webp|avif|svg)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  // allowedDevOrigins: ["192.168.100.13", "localhost"],
  // experimental: {
  //   allowedDevOrigins: ["192.168.100.13", "localhost"],
  // },
};

export default withPWA(nextConfig);
