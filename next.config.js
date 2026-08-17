import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",

  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: false, // لا نعيد تحميل الصفحة عند عودة الاتصال - يبقى الـ UX سلساً

  fallbacks: {
    document: "/~offline",
  },

  workboxOptions: {
    disableDevLogs: true,
    maximumFileSizeToCacheInBytes: 150 * 1024 * 1024,
    runtimeCaching: [
      // ===== الخطوط من Google Fonts =====
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ===== الخطوط المحلية (عربي، قبطي، تيتل) =====
      {
        urlPattern: /\/fonts\/.+\.(?:ttf|woff2?|otf|eot)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "local-fonts",
          expiration: { maxEntries: 30, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ===== API calls: NetworkOnly (الشات والـ AI لا يعملون أوفلاين) =====
      {
        urlPattern: /\/api\/.*/,
        handler: "NetworkOnly",
        options: {
          cacheName: "api-calls",
        },
      },
      // ===== Supabase API: NetworkOnly =====
      {
        urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
        handler: "NetworkOnly",
        options: {
          cacheName: "supabase-api",
        },
      },
      // ===== صفحات التطبيق: NetworkFirst مع fallback من الكاش =====
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages-cache",
          networkTimeoutSeconds: 3, // إذا لم يرد السيرفر في 3 ثواني، يستخدم الكاش
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ===== أصول ثابتة محلية (صور، صوتيات، JSON) =====
      {
        urlPattern:
          /\.(?:png|jpg|jpeg|svg|gif|ico|webp|avif|mp3|wav|ogg|m4a|json|pdf)$/,
        handler: "CacheFirst",
        options: {
          cacheName: "static-assets-cache",
          expiration: { maxEntries: 300, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ===== Next.js Static Assets =====
      {
        urlPattern: /_next\/static\/.+/,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: { maxEntries: 200, maxAgeSeconds: 365 * 24 * 60 * 60 },
        },
      },
      // ===== Next.js Image Optimization =====
      {
        urlPattern: /_next\/image\?.+/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 },
        },
      },
      // ===== Remote Images (Firebase, Google) =====
      {
        urlPattern:
          /https:\/\/(?:firebasestorage\.googleapis\.com|lh3\.googleusercontent\.com)\/.*/,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "remote-images",
          expiration: { maxEntries: 100, maxAgeSeconds: 365 * 24 * 60 * 60 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // ===== ملفات صوت الألحان من R2 =====
      {
        urlPattern: /^https:\/\/pub-08244638454a477bbf9f9548b1fdb3b5\.r2\.dev\/.*/,
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
      // ===== ملفات صوت الألحان من Archive.org =====
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
      // ===== صور: كاش طويل =====
      {
        source: "/(.*).(jpg|jpeg|png|webp|avif|svg)$",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      // ===== ملفات الصوت: Accept-Ranges لـ Safari iOS =====
      {
        source: "/tranim/:path*",
        headers: [
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/sounds/:path*",
        headers: [
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      {
        source: "/3zat/:path*",
        headers: [
          { key: "Accept-Ranges", value: "bytes" },
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
          { key: "Access-Control-Allow-Origin", value: "*" },
        ],
      },
      // ===== Service Worker: لا كاش حتى يُحدَّث دائماً =====
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
      // ===== الـ manifest: كاش قصير =====
      {
        source: "/manifest.webmanifest",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/manifest+json",
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
